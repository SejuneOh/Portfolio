// 공개 문의(이메일·면접 요청) 저장/조회. 서버에서만 호출한다.
import { TOKEN, INQUIRIES_DATABASE_ID } from "../config"

const NOTION_API = "https://api.notion.com/v1"
const NOTION_VERSION = "2022-06-28"

// Inquiries DB 속성명 (사용자 생성 DB 와 일치해야 함)
export const INQUIRY_PROPS = {
  name: "Name",
  email: "Email",
  type: "Type",
  message: "Message",
} as const

// 문의 유형 (select 옵션명)
export const INQUIRY_TYPES = ["이메일 요청", "면접 요청"] as const
export type InquiryType = (typeof INQUIRY_TYPES)[number]

function headers() {
  return {
    accept: "application/json",
    "Notion-Version": NOTION_VERSION,
    "content-type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  }
}

function rich(content: string) {
  const text = content ?? ""
  if (!text) return []
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 2000) chunks.push(text.slice(i, i + 2000))
  return chunks.map((c) => ({ type: "text", text: { content: c } }))
}

export interface InquiryInput {
  name: string
  email: string
  type: string
  message: string
}

export async function createInquiry(input: InquiryInput): Promise<{ id: string }> {
  if (!TOKEN || !INQUIRIES_DATABASE_ID) throw new Error("NOTION_TOKEN / NOTION_INQUIRIES_DB 미설정")

  const properties: Record<string, unknown> = {
    [INQUIRY_PROPS.name]: { title: rich(input.name) },
    [INQUIRY_PROPS.email]: { email: input.email },
    [INQUIRY_PROPS.message]: { rich_text: rich(input.message) },
  }
  if (input.type) properties[INQUIRY_PROPS.type] = { select: { name: input.type } }

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ parent: { database_id: INQUIRIES_DATABASE_ID }, properties }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`문의 저장 실패 (${res.status}): ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as { id: string }
}

export interface Inquiry {
  id: string
  name: string
  email: string
  type: string
  message: string
  createdTime: string
}

interface NotionRichText {
  plain_text?: string
}
interface NotionPage {
  id: string
  created_time?: string
  properties?: Record<string, unknown>
}

function plain(rt?: NotionRichText[]): string {
  return (rt || []).map((t) => t.plain_text ?? "").join("")
}

// 관리자 목록용. 미설정/실패 시 빈 배열(관리자 페이지에서 빈 상태 안내).
export async function getInquiries(): Promise<Inquiry[]> {
  if (!TOKEN || !INQUIRIES_DATABASE_ID) return []

  try {
    const res = await fetch(`${NOTION_API}/databases/${INQUIRIES_DATABASE_ID}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        sorts: [{ timestamp: "created_time", direction: "descending" }],
        page_size: 100,
      }),
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`Notion API ${res.status}`)
    const json = (await res.json()) as { results?: NotionPage[] }

    return (json.results || []).map((page) => {
      const p = (name: string) => page.properties?.[name] as Record<string, unknown> | undefined
      return {
        id: page.id,
        name: plain(p(INQUIRY_PROPS.name)?.title as NotionRichText[] | undefined),
        email: (p(INQUIRY_PROPS.email)?.email as string) ?? "",
        type: ((p(INQUIRY_PROPS.type)?.select as { name?: string } | undefined)?.name) ?? "",
        message: plain(p(INQUIRY_PROPS.message)?.rich_text as NotionRichText[] | undefined),
        createdTime: page.created_time ?? "",
      }
    })
  } catch (e) {
    console.error("[inquiries] Notion fetch failed:", (e as Error).message)
    return []
  }
}
