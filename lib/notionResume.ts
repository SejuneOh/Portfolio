/*
  이력서를 Notion 에서 읽는다 (#262 2단계). 쓰기는 3단계다.

  ## 어디에 저장하나

  DB 행 하나에 이력서 전체가 들어간다. 내용은 **페이지 본문의 코드 블록**에 JSON 으로 있다.

      Resume DB
        └ 행 "resume"
            └ 본문: code 블록 (language: json) — 2000자마다 잘려 여러 개일 수 있다

  **속성이 아니다.** Notion rich_text 는 항목당 2000자 제한이 있고
  (lib/notionWrite.ts:36 에 같은 사실이 적혀 있다) 이력서 JSON 은 그보다 길다.
  본문 블록은 여러 개를 이어 붙이면 되므로 길이 천장이 사실상 없다 — 블로그 본문이 이미
  그 길을 쓴다.

  ## 폴백

  아래 **어느 경우에도** lib/resumeData.ts 로 떨어진다. 화면은 항상 뜬다.

      토큰·DB id 없음      로컬·프리뷰에서 env 를 안 넣은 경우
      조회 실패            네트워크·권한·404
      행이 없음            DB 는 만들었지만 아직 안 채운 경우
      JSON 이 깨짐         쓰다가 중단된 경우
      모양이 다름          스키마가 안 맞는 경우 (lib/resumeSchema.ts)

  이 폴백은 다른 폴백보다 중요하다 — 이력서를 **한 칸에 통째로** 저장하기로 했으므로
  한 번 잘못 쓰면 전부 잃는다. 그래서 실패를 조용히 넘기지 않고 서버 로그에 이유를 남긴다.
  조용한 폴백은 "왜 옛 내용이 나오지?" 를 영영 못 찾게 만든다.
*/

import { RESUME_DATABASE_ID, TOKEN } from "../config"
import { resumeData, type ResumeData } from "./resumeData"
import { validateResume } from "./resumeSchema"

const NOTION_API = "https://api.notion.com/v1"
const NOTION_VERSION = "2022-06-28"
const REVALIDATE = 3600

/** 이력서 행을 찾는 제목. DB 에 행이 여러 개면 이것을 먼저 찾고, 없으면 첫 행을 쓴다. */
export const RESUME_ROW_TITLE = "resume"

export const RESUME_PROPS = {
  title: "Title",
} as const

function headers() {
  return {
    accept: "application/json",
    "Notion-Version": NOTION_VERSION,
    "content-type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  }
}

interface NotionRichText {
  plain_text?: string
}
interface NotionBlock {
  type?: string
  code?: { rich_text?: NotionRichText[] }
  paragraph?: { rich_text?: NotionRichText[] }
}
interface NotionPage {
  id: string
  properties?: Record<string, unknown>
}

/** 폴백으로 떨어진 이유. 화면에는 쓰지 않고 로그에만 남긴다. */
export type ResumeSource =
  | { from: "notion"; pageId: string }
  | { from: "fallback"; reason: string; detail?: string[] }

function warn(reason: string, detail?: string[]) {
  // 서버 로그. 이력서가 옛 내용으로 보일 때 여기부터 본다.
  console.warn(`[resume] Notion 대신 코드 폴백을 쓴다 — ${reason}`)
  if (detail?.length) for (const d of detail.slice(0, 12)) console.warn(`[resume]   · ${d}`)
}

function readTitle(page: NotionPage): string {
  const prop = page.properties?.[RESUME_PROPS.title] as
    | { title?: NotionRichText[] }
    | undefined
  return (prop?.title || []).map((t) => t.plain_text || "").join("")
}

/** 본문 블록에서 JSON 문자열을 모은다. code 블록만 본다 — 사람이 적은 메모(문단)는 건너뛴다. */
function joinCodeText(blocks: NotionBlock[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    if (b.type !== "code") continue
    for (const t of b.code?.rich_text || []) parts.push(t.plain_text || "")
  }
  return parts.join("")
}

async function fetchChildren(pageId: string, fresh: boolean): Promise<NotionBlock[]> {
  const out: NotionBlock[] = []
  let cursor: string | undefined
  do {
    const url = new URL(`${NOTION_API}/blocks/${pageId}/children`)
    url.searchParams.set("page_size", "100")
    if (cursor) url.searchParams.set("start_cursor", cursor)
    const res = await fetch(
      url.toString(),
      fresh
        ? { headers: headers(), cache: "no-store" }
        : { headers: headers(), next: { revalidate: REVALIDATE } }
    )
    if (!res.ok) throw new Error(`blocks ${res.status}`)
    const json = (await res.json()) as {
      results?: NotionBlock[]
      has_more?: boolean
      next_cursor?: string | null
    }
    for (const b of json.results || []) out.push(b)
    cursor = json.has_more ? json.next_cursor ?? undefined : undefined
  } while (cursor)
  return out
}

/**
 * 이력서를 읽는다. **절대 던지지 않는다** — 어떤 실패든 코드 폴백으로 떨어진다.
 * `fresh` 는 관리 화면에서 저장 직후 읽을 때 쓴다(ISR 캐시를 건너뛴다).
 */
export async function getResume(fresh = false): Promise<{
  data: ResumeData
  source: ResumeSource
}> {
  const fallback = (reason: string, detail?: string[]) => {
    warn(reason, detail)
    return { data: resumeData, source: { from: "fallback" as const, reason, detail } }
  }

  if (!TOKEN || !RESUME_DATABASE_ID) {
    // 흔한 경우다(로컬·프리뷰). 경고를 남기지만 놀랄 일은 아니다.
    return fallback("NOTION_TOKEN 또는 NOTION_RESUME_DB 가 없다")
  }

  let page: NotionPage
  try {
    const res = await fetch(
      `${NOTION_API}/databases/${RESUME_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ page_size: 20 }),
        ...(fresh ? { cache: "no-store" } : { next: { revalidate: REVALIDATE } }),
      }
    )
    if (!res.ok) return fallback(`DB 조회 실패 (${res.status})`)
    const json = (await res.json()) as { results?: NotionPage[] }
    const rows = json.results || []
    if (rows.length === 0) return fallback("DB 에 행이 없다")
    // 제목이 "resume" 인 행을 먼저 찾는다. 없으면 첫 행 — 행 이름을 바꿔도 동작하게.
    page =
      rows.find((r) => readTitle(r).trim().toLowerCase() === RESUME_ROW_TITLE) ?? rows[0]
  } catch (e) {
    return fallback("DB 조회 중 오류", [String(e)])
  }

  let raw: string
  try {
    raw = joinCodeText(await fetchChildren(page.id, fresh))
  } catch (e) {
    return fallback("본문 블록 조회 중 오류", [String(e)])
  }

  if (!raw.trim()) return fallback("본문에 코드 블록이 없다 (JSON 을 넣어야 한다)")

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    // 쓰다가 중단되면 여기로 온다. 통째 교체 방식이라 반쪽 JSON 이 남을 수 있다.
    return fallback("본문 JSON 을 읽을 수 없다", [String(e)])
  }

  const checked = validateResume(parsed)
  if (!checked.ok) return fallback("JSON 모양이 이력서와 다르다", checked.problems)

  return { data: checked.data, source: { from: "notion", pageId: page.id } }
}
