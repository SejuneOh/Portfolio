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
import { replaceChildren } from "./notionWrite"
import { checkResumeRules } from "./resumeRules"
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

// ── 쓰기 (#262 3단계) ────────────────────────────────────────────────────────

/*
  JSON 을 code 블록으로 쪼갠다.

  두 가지를 지킨다.
  - **항목당 2000자** — Notion rich_text 제한(lib/notionWrite.ts:36 에 같은 사실이 적혀 있다)
  - **줄 경계에서만 자른다** — 들여쓴 JSON 을 글자 수로 자르면 블록 경계가 줄 중간에 떨어져
    Notion 에서 열어 볼 때 깨진 것처럼 보인다. 어차피 사람이 그 화면에서 고치지는 않지만,
    **눈으로 확인하는 길**은 이 저장 방식에서 남은 유일한 확인 수단이라 읽히게 둔다.

  들여쓰기를 넣는 이유도 같다 — 한 줄로 붙여 두면 Notion 에서 아무것도 읽을 수 없다.
*/
export function resumeToBlocks(data: ResumeData): Record<string, unknown>[] {
  const json = JSON.stringify(data, null, 2)
  const LIMIT = 2000

  /*
    **이어 붙이면 원문이 글자 하나까지 복원되게 자른다.**

    읽는 쪽(joinCodeText)은 블록을 `""` 로 이어 붙인다. 그래서 조각이 원문을 그대로 나눈 것이
    아니면 복원되지 않는다. 전에는 줄 단위로 모으면서 **조각 사이의 개행을 버렸다** — JSON 은
    공백에 관대하니 파싱은 됐지만, 두 번째 블록부터 줄 중간처럼 시작해 Notion 에서 읽기 어려웠다.
    검사도 `"\n"` 으로 이어 붙여 프로덕션과 다른 것을 재고 있었다(둘 다 검사에서 지적됨).

    지금은 원문을 훑어 자르고, 가능하면 **개행 바로 뒤**에서 끊는다. 개행이 조각에 포함되므로
    join("") 이 원문과 같다. 한 줄이 혼자 2000자를 넘으면(아주 긴 항목 본문) 어쩔 수 없이
    글자 수로 자른다 — 그때도 join("") 은 여전히 원문이다.
  */
  const chunks: string[] = []
  let at = 0
  while (at < json.length) {
    let end = Math.min(at + LIMIT, json.length)
    if (end < json.length) {
      const lastBreak = json.lastIndexOf("\n", end - 1)
      if (lastBreak > at) end = lastBreak + 1 // 개행을 조각에 포함시킨다
    }
    chunks.push(json.slice(at, end))
    at = end
  }

  return chunks.map((c) => ({
    object: "block",
    type: "code",
    code: {
      language: "json",
      rich_text: [{ type: "text", text: { content: c } }],
    },
  }))
}

/*
  쓸 행을 찾는다. **읽기와 규칙이 다르다 — 일부러 다르다.**

  읽기는 제목이 맞는 행이 없으면 첫 행을 본다. 엉뚱한 행을 읽어도 결과는 폴백이라 손해가 없다.
  쓰기는 그럴 수 없다 — `replaceChildren` 이 그 페이지의 본문을 **전부 지우고** 이력서 JSON 으로
  덮는다. DB 에 메모 행이 하나 있었다는 이유로 그 메모가 사라지면 되돌릴 수 없다.
  검사에서 지적된 것이고, 그래서 쓰기는 **제목이 정확히 맞는 행만** 쓴다.

  제목으로 걸러 조회하므로 행이 많아도(읽기의 page_size 20 창 밖에 있어도) 찾는다.
*/
async function findOrCreateRow(): Promise<string> {
  const res = await fetch(`${NOTION_API}/databases/${RESUME_DATABASE_ID}/query`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      filter: { property: RESUME_PROPS.title, title: { equals: RESUME_ROW_TITLE } },
      page_size: 5,
    }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`DB 조회 실패 (${res.status})`)
  const json = (await res.json()) as { results?: NotionPage[] }
  const rows = json.results || []
  const found = rows.find((r) => readTitle(r).trim().toLowerCase() === RESUME_ROW_TITLE)
  if (found) return found.id

  // 제목이 맞는 행이 없으면 **만든다.** 아무 행이나 덮어쓰지 않는다.
  // 사람이 Notion 에서 행을 먼저 만들어야 저장이 된다면 그것을 알 방법이 없다.
  const created = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      parent: { database_id: RESUME_DATABASE_ID },
      properties: {
        [RESUME_PROPS.title]: { title: [{ text: { content: RESUME_ROW_TITLE } }] },
      },
    }),
  })
  if (!created.ok) {
    const detail = await created.text().catch(() => "")
    throw new Error(`행 생성 실패 (${created.status}): ${detail.slice(0, 200)}`)
  }
  return ((await created.json()) as { id: string }).id
}

/**
 * 이력서를 저장한다. **저장 전에 스키마를 검사한다** — 읽기에서만 막으면 잘못된 값이
 * 이미 저장된 뒤에 발견되고, 이 구조에서는 그것이 이력서 전체를 잃는 것과 같다.
 *
 * getResume() 과 달리 **던진다.** 저장은 사용자가 결과를 기다리는 동작이라, 조용히
 * 실패하면 "저장했다"고 착각하게 된다.
 */
export async function saveResume(
  data: ResumeData
): Promise<{ pageId: string; warnings: string[] }> {
  if (!TOKEN || !RESUME_DATABASE_ID)
    throw new Error("NOTION_TOKEN 또는 NOTION_RESUME_DB 가 설정되지 않았습니다.")

  const checked = validateResume(data)
  if (!checked.ok)
    throw new Error(`이력서 모양이 올바르지 않습니다 — ${checked.problems.join(" / ")}`)

  /*
    모양 다음에 **규칙**을 본다 (#262 4단계). 여기서 막는 것은 어기면 화면이 #256 이 없앤
    상태로 돌아가는 것들이다. 경고는 막지 않고 돌려준다 — 부르는 쪽이 사람에게 보여 준다.

    이 검사를 액션이 아니라 여기 두는 이유는, 액션을 거치지 않는 호출도 막기 위해서다.
  */
  const rules = checkResumeRules(checked.data)
  if (rules.errors.length)
    throw new Error(`규칙을 지키지 않았습니다 — ${rules.errors.join(" / ")}`)

  const pageId = await findOrCreateRow()
  // 새 블록을 먼저 붙이고 성공한 뒤 옛 블록을 지운다(lib/notionWrite.ts 의 replaceChildren).
  await replaceChildren(pageId, resumeToBlocks(checked.data))
  return { pageId, warnings: rules.warnings }
}
