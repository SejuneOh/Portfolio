// Notion 쓰기(생성·수정·아카이브) 헬퍼. 서버(Server Action)에서만 호출한다.
// 읽기(lib/postsData.ts, lib/notion.ts)와 동일한 REST API·속성명을 재사용한다.
import type { Block } from "./posts"
import { TOKEN, DATABASE_ID, BLOG_DATABASE_ID } from "../config"
import { BLOG_PROPS } from "./postsData"
import { fenceToNotion } from "./codeLang"

const NOTION_API = "https://api.notion.com/v1"
const NOTION_VERSION = "2022-06-28"

// 프로젝트 DB 속성명 (lib/notion.ts 읽기 매핑과 일치)
export const PROJECT_PROPS = {
  name: "projectName",
  description: "description",
  tags: "tag",
  github: "github",
  workPeriod: "workPeriod",
  status: "status",
  impact: "impact",
  role: "role",
  teamSize: "teamSize",
  liveUrl: "liveUrl",
  group: "group",
  groupSummary: "groupSummary",
} as const

function headers() {
  return {
    accept: "application/json",
    "Notion-Version": NOTION_VERSION,
    "content-type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  }
}

// Notion rich_text 는 항목당 content 2000자 제한 → 안전하게 청크로 분할.
function rich(content: string) {
  const text = content ?? ""
  if (!text) return []
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 2000) chunks.push(text.slice(i, i + 2000))
  return chunks.map((c) => ({ type: "text", text: { content: c } }))
}

function block(type: string, content: string, extra: Record<string, unknown> = {}) {
  return {
    object: "block",
    type,
    [type]: { rich_text: rich(content), ...extra },
  }
}

// 마크다운 유사 본문 텍스트 → Notion 블록 배열.
// 지원: # / ## / ### 헤딩, ``` 코드펜스, - / * 목록, 그 외 문단(빈 줄로 분리).
export function textToBlocks(src: string): Record<string, unknown>[] {
  const lines = (src ?? "").replace(/\r\n/g, "\n").split("\n")
  const blocks: Record<string, unknown>[] = []
  let para: string[] = []
  let inCode = false
  let codeBuf: string[] = []
  let codeLang = "" // 펜스 언어(```ts 등)

  const flushPara = () => {
    if (para.length) {
      const t = para.join(" ").trim()
      if (t) blocks.push(block("paragraph", t))
      para = []
    }
  }

  for (const line of lines) {
    const fence = line.trim().startsWith("```")
    if (fence) {
      if (inCode) {
        blocks.push(block("code", codeBuf.join("\n"), { language: fenceToNotion(codeLang) }))
        codeBuf = []
        codeLang = ""
        inCode = false
      } else {
        flushPara()
        inCode = true
        codeLang = line.trim().slice(3).trim() // ```ts → "ts"
      }
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      continue
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/)
    const li = line.match(/^[-*]\s+(.*)$/)
    if (h) {
      flushPara()
      const level = h[1].length
      blocks.push(block(`heading_${level}`, h[2].trim()))
    } else if (li) {
      flushPara()
      blocks.push(block("bulleted_list_item", li[1].trim()))
    } else if (line.trim() === "") {
      flushPara()
    } else {
      para.push(line.trim())
    }
  }
  if (inCode && codeBuf.length) blocks.push(block("code", codeBuf.join("\n"), { language: fenceToNotion(codeLang) }))
  flushPara()
  return blocks
}

// Notion 블록 배열 → 마크다운 유사 본문 텍스트 (textToBlocks 의 역변환).
// 수정 폼 프리필에 사용. 헤딩은 ## 로 통일(왕복 시 heading_2).
export function blocksToText(blocks: Block[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    if (b.h) parts.push(`## ${b.h}`)
    else if (b.code) {
      const fence = b.lang && b.lang !== "plain text" ? "```" + b.lang : "```"
      parts.push(fence + "\n" + b.code + "\n```")
    }
    else if (b.ul) parts.push(b.ul.map((li) => `- ${li}`).join("\n"))
    else if (b.p) parts.push(b.p)
  }
  return parts.join("\n\n")
}

async function createPage(body: Record<string, unknown>) {
  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Notion 페이지 생성 실패 (${res.status}): ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as { id: string }
}

async function patchPage(id: string, body: Record<string, unknown>) {
  const res = await fetch(`${NOTION_API}/pages/${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Notion 페이지 수정 실패 (${res.status}): ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as { id: string }
}

// 페이지의 모든 하위 블록 id 를 페이지네이션으로 수집(100개 초과 대응).
async function listChildIds(pageId: string): Promise<string[]> {
  const ids: string[] = []
  let cursor: string | undefined
  do {
    const url = new URL(`${NOTION_API}/blocks/${pageId}/children`)
    url.searchParams.set("page_size", "100")
    if (cursor) url.searchParams.set("start_cursor", cursor)
    const res = await fetch(url.toString(), { headers: headers(), cache: "no-store" })
    if (!res.ok) throw new Error(`기존 블록 조회 실패 (${res.status})`)
    const json = (await res.json()) as {
      results?: { id: string }[]
      has_more?: boolean
      next_cursor?: string | null
    }
    for (const b of json.results || []) ids.push(b.id)
    cursor = json.has_more ? json.next_cursor ?? undefined : undefined
  } while (cursor)
  return ids
}

// children 을 ≤100 청크로 append(Notion 은 요청당 children 100개 제한).
async function appendChildren(pageId: string, children: Record<string, unknown>[]) {
  for (let i = 0; i < children.length; i += 100) {
    const chunk = children.slice(i, i + 100)
    const res = await fetch(`${NOTION_API}/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ children: chunk }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      throw new Error(`본문 저장 실패 (${res.status}): ${detail.slice(0, 200)}`)
    }
  }
}

// 배치 병렬 삭제(동시성 제한 — 왕복 지연 완화).
async function deleteBlocks(ids: string[]) {
  const CONCURRENCY = 8
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    await Promise.all(
      ids.slice(i, i + CONCURRENCY).map((id) =>
        fetch(`${NOTION_API}/blocks/${id}`, { method: "DELETE", headers: headers() })
      )
    )
  }
}

// 본문 교체: 유실 방지를 위해 **새 블록을 먼저 append → 성공 후 옛 블록 삭제** 순서.
// 중간 실패 시 최악은 '본문 중복'(복구 가능)이며, 유실은 발생하지 않는다.
async function replaceBody(pageId: string, bodyText: string) {
  const oldIds = await listChildIds(pageId) // 1) 옛 블록 파악(페이지네이션)
  await appendChildren(pageId, textToBlocks(bodyText)) // 2) 새 본문 먼저 추가(≤100 청크)
  await deleteBlocks(oldIds) // 3) 성공한 뒤에만 옛 블록 삭제
}

export interface BlogInput {
  title: string
  slug: string
  date: string
  category: string
  tags: string[]
  summary: string
  body: string
  published: boolean
}

function blogProperties(input: BlogInput): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    [BLOG_PROPS.title]: { title: rich(input.title) },
    [BLOG_PROPS.slug]: { rich_text: rich(input.slug) },
    [BLOG_PROPS.summary]: { rich_text: rich(input.summary) },
    [BLOG_PROPS.tags]: { multi_select: input.tags.map((name) => ({ name })) },
    [BLOG_PROPS.published]: { checkbox: input.published },
  }
  // 날짜/카테고리는 비면 아예 넣지 않는다(생성) / 비우면 null 로 클리어(수정).
  properties[BLOG_PROPS.date] = input.date ? { date: { start: input.date } } : { date: null }
  properties[BLOG_PROPS.category] = input.category
    ? { select: { name: input.category } }
    : { select: null }
  return properties
}

export async function createBlogPage(input: BlogInput): Promise<{ id: string }> {
  if (!TOKEN || !BLOG_DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_BLOG_DB 미설정")
  // 페이지를 먼저 만들고 본문은 ≤100 청크로 append(children 100 제한·긴 글 대응).
  const page = await createPage({
    parent: { database_id: BLOG_DATABASE_ID },
    properties: blogProperties(input),
  })
  await appendChildren(page.id, textToBlocks(input.body))
  return page
}

// replaceBodyContent=false 면 속성만 갱신하고 본문 블록 교체를 건너뛴다.
// 본문이 안 바뀐 수정(메타만 변경/재저장)에서 다건 블록 삭제·재생성을 피해 빠르게 저장.
export async function updateBlogPage(
  id: string,
  input: BlogInput,
  replaceBodyContent = true
): Promise<{ id: string }> {
  if (!TOKEN || !BLOG_DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_BLOG_DB 미설정")
  await patchPage(id, { properties: blogProperties(input) })
  if (replaceBodyContent) await replaceBody(id, input.body)
  return { id }
}

// 삭제 = 아카이브(Notion 엔 하드 삭제 API 없음). Notion 휴지통에서 복구 가능.
export async function archiveBlogPage(id: string): Promise<void> {
  if (!TOKEN) throw new Error("NOTION_TOKEN 미설정")
  await patchPage(id, { archived: true })
}

export async function setBlogPublished(id: string, published: boolean): Promise<void> {
  if (!TOKEN) throw new Error("NOTION_TOKEN 미설정")
  await patchPage(id, { properties: { [BLOG_PROPS.published]: { checkbox: published } } })
}

export interface ProjectInput {
  name: string
  description: string
  tags: string[]
  github: string
  startDate: string
  endDate: string
  status: string
  // 케이스스터디/대분류 필드 (Notion projects DB 에 이미 존재하는 속성)
  impact: string
  role: string
  teamSize: string
  liveUrl: string
  group: string
  groupSummary: string
  // 페이지 커버 이미지 URL(외부). 상세 히어로·목록 카드에 노출.
  cover: string
  // 상세 본문(마크다운 유사 텍스트).
  body: string
}

// 생성/수정 공용 속성 빌더.
// 수정 시엔 빈 값을 null 로 클리어(생성 시엔 빈 값은 넣지 않아도 동일 효과지만
// 일관성·명확성을 위해 동일 규칙 적용).
function projectProperties(input: ProjectInput): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    [PROJECT_PROPS.name]: { title: rich(input.name) },
    [PROJECT_PROPS.description]: { rich_text: rich(input.description) },
    [PROJECT_PROPS.tags]: { multi_select: input.tags.map((name) => ({ name })) },
    [PROJECT_PROPS.impact]: { rich_text: rich(input.impact) },
    [PROJECT_PROPS.role]: { rich_text: rich(input.role) },
    [PROJECT_PROPS.teamSize]: { rich_text: rich(input.teamSize) },
    [PROJECT_PROPS.groupSummary]: { rich_text: rich(input.groupSummary) },
  }
  properties[PROJECT_PROPS.github] = input.github ? { url: input.github } : { url: null }
  properties[PROJECT_PROPS.liveUrl] = input.liveUrl ? { url: input.liveUrl } : { url: null }
  properties[PROJECT_PROPS.workPeriod] = input.startDate
    ? { date: { start: input.startDate, end: input.endDate || null } }
    : { date: null }
  properties[PROJECT_PROPS.status] = input.status
    ? { status: { name: input.status } }
    : { status: null }
  properties[PROJECT_PROPS.group] = input.group
    ? { select: { name: input.group } }
    : { select: null }
  return properties
}

export async function createProjectPage(input: ProjectInput): Promise<{ id: string }> {
  if (!TOKEN || !DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_DB 미설정")

  const page: Record<string, unknown> = {
    parent: { database_id: DATABASE_ID },
    properties: projectProperties(input),
  }
  if (input.cover) page.cover = { type: "external", external: { url: input.cover } }

  const created = await createPage(page)
  await appendChildren(created.id, textToBlocks(input.body))
  return created
}

// replaceBodyContent=false 면 속성만 갱신하고 본문 블록 교체를 건너뛴다(빠른 저장).
export async function updateProjectPage(
  id: string,
  input: ProjectInput,
  replaceBodyContent = true
): Promise<{ id: string }> {
  if (!TOKEN || !DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_DB 미설정")

  const body: Record<string, unknown> = { properties: projectProperties(input) }
  // 커버: URL 이 있으면 설정, 비우면 제거(null).
  body.cover = input.cover ? { type: "external", external: { url: input.cover } } : null

  await patchPage(id, body)
  if (replaceBodyContent) await replaceBody(id, input.body)
  return { id }
}

// 삭제 = 아카이브(Notion 휴지통에서 복구 가능).
export async function archiveProjectPage(id: string): Promise<void> {
  if (!TOKEN) throw new Error("NOTION_TOKEN 미설정")
  await patchPage(id, { archived: true })
}
