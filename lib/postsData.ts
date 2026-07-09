import type { Block, Post } from "./posts"
import { TOKEN, BLOG_DATABASE_ID } from "../config"
import { fallbackPosts } from "./postsFallback"

// ── Notion 블로그 DB 스키마(속성명) ──────────────────────────────
// 사용자가 Notion 에서 만드는 DB 의 속성 이름과 정확히 일치해야 한다.
// PR-C(쓰기)도 동일한 상수를 재사용한다.
export const BLOG_PROPS = {
  title: "Title",
  slug: "Slug",
  date: "Date",
  category: "Category",
  tags: "Tags",
  summary: "Summary",
  published: "Published",
} as const

const NOTION_API = "https://api.notion.com/v1"
const NOTION_VERSION = "2022-06-28"
const REVALIDATE = 3600

function headers() {
  return {
    accept: "application/json",
    "Notion-Version": NOTION_VERSION,
    "content-type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  }
}

// ── Notion 응답 중 실제 사용하는 필드만 최소 정의 ────────────────
interface NotionRichText {
  plain_text?: string
}
interface NotionPage {
  id: string
  properties?: Record<string, unknown>
}
interface NotionBlock {
  type?: string
  heading_1?: { rich_text?: NotionRichText[] }
  heading_2?: { rich_text?: NotionRichText[] }
  heading_3?: { rich_text?: NotionRichText[] }
  paragraph?: { rich_text?: NotionRichText[] }
  code?: { rich_text?: NotionRichText[] }
  bulleted_list_item?: { rich_text?: NotionRichText[] }
  numbered_list_item?: { rich_text?: NotionRichText[] }
}

function plain(rt?: NotionRichText[]): string {
  return (rt || []).map((t) => t.plain_text ?? "").join("")
}

// Notion property 접근 헬퍼 (구조가 느슨해 안전하게 캐스팅)
function prop(page: NotionPage, name: string): Record<string, unknown> | undefined {
  const p = page.properties?.[name]
  return p as Record<string, unknown> | undefined
}

function readTitle(page: NotionPage, name: string): string {
  const t = prop(page, name)?.title as NotionRichText[] | undefined
  return plain(t)
}
function readRichText(page: NotionPage, name: string): string {
  const t = prop(page, name)?.rich_text as NotionRichText[] | undefined
  return plain(t)
}
function readSelect(page: NotionPage, name: string): string {
  const s = prop(page, name)?.select as { name?: string } | undefined
  return s?.name ?? ""
}
function readMultiSelect(page: NotionPage, name: string): string[] {
  const m = prop(page, name)?.multi_select as { name?: string }[] | undefined
  return (m || []).map((o) => o.name ?? "").filter(Boolean)
}
function readDate(page: NotionPage, name: string): string {
  const d = prop(page, name)?.date as { start?: string } | undefined
  return d?.start ?? ""
}

// 페이지 하위 블록을 조회해 렌더용 Block[] 로 변환.
// 연속된 목록 아이템은 하나의 { ul } 로 묶는다.
async function fetchBody(pageId: string): Promise<Block[]> {
  const res = await fetch(
    `${NOTION_API}/blocks/${pageId}/children?page_size=100`,
    { headers: headers(), next: { revalidate: REVALIDATE } }
  )
  if (!res.ok) throw new Error(`Notion blocks ${res.status}`)
  const json = (await res.json()) as { results?: NotionBlock[] }

  const blocks: Block[] = []
  let listBuf: string[] = []
  const flushList = () => {
    if (listBuf.length) {
      blocks.push({ ul: listBuf })
      listBuf = []
    }
  }

  for (const b of json.results || []) {
    switch (b.type) {
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        flushList()
        const h = plain(b[b.type]?.rich_text)
        if (h) blocks.push({ h })
        break
      }
      case "paragraph": {
        flushList()
        const p = plain(b.paragraph?.rich_text)
        if (p.trim()) blocks.push({ p })
        break
      }
      case "code": {
        flushList()
        const code = plain(b.code?.rich_text)
        if (code) blocks.push({ code })
        break
      }
      case "bulleted_list_item":
      case "numbered_list_item": {
        const li = plain(b[b.type]?.rich_text)
        if (li) listBuf.push(li)
        break
      }
      default:
        flushList()
    }
  }
  flushList()
  return blocks
}

async function mapPage(page: NotionPage): Promise<Post> {
  const slug = readRichText(page, BLOG_PROPS.slug) || page.id
  const body = await fetchBody(page.id)
  return {
    slug,
    title: readTitle(page, BLOG_PROPS.title),
    date: readDate(page, BLOG_PROPS.date),
    category: readSelect(page, BLOG_PROPS.category),
    tags: readMultiSelect(page, BLOG_PROPS.tags),
    summary: readRichText(page, BLOG_PROPS.summary),
    body,
  }
}

// 발행된 블로그 글을 최신순으로 반환. Notion 미설정/실패/빈 결과면 시드로 fallback.
export async function getPosts(): Promise<Post[]> {
  if (!TOKEN || !BLOG_DATABASE_ID) return fallbackPosts

  try {
    const res = await fetch(
      `${NOTION_API}/databases/${BLOG_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          filter: { property: BLOG_PROPS.published, checkbox: { equals: true } },
          sorts: [{ property: BLOG_PROPS.date, direction: "descending" }],
          page_size: 100,
        }),
        next: { revalidate: REVALIDATE },
      }
    )
    if (!res.ok) throw new Error(`Notion API ${res.status}`)
    const json = (await res.json()) as { results?: NotionPage[] }

    const pages = json.results || []
    if (pages.length === 0) return fallbackPosts

    const posts = await Promise.all(pages.map(mapPage))
    return posts.filter((p) => p.title)
  } catch (e) {
    console.error("[posts] Notion fetch failed:", (e as Error).message)
    return fallbackPosts
  }
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const posts = await getPosts()
  return posts.find((p) => p.slug === slug)
}

// 목록 순서 기준 이전/다음 글 (배열 앞쪽이 최신)
export async function getAdjacent(
  slug: string
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getPosts()
  const i = posts.findIndex((p) => p.slug === slug)
  return {
    prev: i >= 0 && i < posts.length - 1 ? posts[i + 1] : null, // 더 오래된 글
    next: i > 0 ? posts[i - 1] : null, // 더 최신 글
  }
}
