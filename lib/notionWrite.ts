// Notion 쓰기(생성·수정·아카이브) 헬퍼. 서버(Server Action)에서만 호출한다.
// 읽기(lib/postsData.ts, lib/notion.ts)와 동일한 REST API·속성명을 재사용한다.
import type { Block } from "./posts"
import { TOKEN, DATABASE_ID, BLOG_DATABASE_ID } from "../config"
import { BLOG_PROPS } from "./postsData"

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
        blocks.push(block("code", codeBuf.join("\n"), { language: "plain text" }))
        codeBuf = []
        inCode = false
      } else {
        flushPara()
        inCode = true
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
  if (inCode && codeBuf.length) blocks.push(block("code", codeBuf.join("\n"), { language: "plain text" }))
  flushPara()
  return blocks
}

// Notion 블록 배열 → 마크다운 유사 본문 텍스트 (textToBlocks 의 역변환).
// 수정 폼 프리필에 사용. 헤딩은 ## 로 통일(왕복 시 heading_2).
export function blocksToText(blocks: Block[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    if (b.h) parts.push(`## ${b.h}`)
    else if (b.code) parts.push("```\n" + b.code + "\n```")
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

// 본문 교체: Notion 엔 children 전체 교체 API 가 없어 기존 블록 삭제 후 새로 append.
async function replaceBody(pageId: string, bodyText: string) {
  const listRes = await fetch(`${NOTION_API}/blocks/${pageId}/children?page_size=100`, {
    headers: headers(),
    cache: "no-store",
  })
  if (!listRes.ok) throw new Error(`기존 블록 조회 실패 (${listRes.status})`)
  const list = (await listRes.json()) as { results?: { id: string }[] }

  for (const b of list.results || []) {
    await fetch(`${NOTION_API}/blocks/${b.id}`, { method: "DELETE", headers: headers() })
  }

  const children = textToBlocks(bodyText)
  if (children.length) {
    const appendRes = await fetch(`${NOTION_API}/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ children }),
    })
    if (!appendRes.ok) {
      const detail = await appendRes.text().catch(() => "")
      throw new Error(`본문 저장 실패 (${appendRes.status}): ${detail.slice(0, 200)}`)
    }
  }
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
  return createPage({
    parent: { database_id: BLOG_DATABASE_ID },
    properties: blogProperties(input),
    children: textToBlocks(input.body),
  })
}

export async function updateBlogPage(id: string, input: BlogInput): Promise<{ id: string }> {
  if (!TOKEN || !BLOG_DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_BLOG_DB 미설정")
  await patchPage(id, { properties: blogProperties(input) })
  await replaceBody(id, input.body)
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
}

export async function createProjectPage(input: ProjectInput): Promise<{ id: string }> {
  if (!TOKEN || !DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_DB 미설정")

  const properties: Record<string, unknown> = {
    [PROJECT_PROPS.name]: { title: rich(input.name) },
    [PROJECT_PROPS.description]: { rich_text: rich(input.description) },
    [PROJECT_PROPS.tags]: { multi_select: input.tags.map((name) => ({ name })) },
  }
  if (input.github) properties[PROJECT_PROPS.github] = { url: input.github }
  if (input.startDate)
    properties[PROJECT_PROPS.workPeriod] = {
      date: { start: input.startDate, end: input.endDate || null },
    }
  if (input.status) properties[PROJECT_PROPS.status] = { status: { name: input.status } }

  return createPage({ parent: { database_id: DATABASE_ID }, properties })
}
