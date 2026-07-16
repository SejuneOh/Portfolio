import type {
  Experience,
  ProjectGroup,
  ProjectTag,
} from "../components/projects/projectItem"
import { TOKEN, DATABASE_ID } from "../config"
import { fallbackExperiences } from "./projectsFallback"
import { fetchBody } from "./postsData"

// Notion query 응답 중 실제로 사용하는 필드만 최소한으로 정의
interface NotionText {
  plain_text?: string
}
interface NotionSelectOption {
  id: string
  name: string
}
interface NotionProperties {
  projectName?: { title?: NotionText[] }
  description?: { rich_text?: NotionText[] }
  tag?: { multi_select?: NotionSelectOption[] }
  github?: { url?: string }
  workPeriod?: { date?: { start?: string; end?: string } }
  status?: { status?: { name?: string } }
  impact?: { rich_text?: NotionText[] }
  role?: { rich_text?: NotionText[] }
  teamSize?: { rich_text?: NotionText[] }
  liveUrl?: { url?: string }
  group?: { select?: { name?: string } }
  groupSummary?: { rich_text?: NotionText[] }
}
interface NotionPage {
  id: string
  properties?: NotionProperties
  cover?: { external?: { url?: string }; file?: { url?: string } }
}
interface NotionQueryResponse {
  results?: NotionPage[]
}

function mapExperience(data: NotionPage): Experience {
  const p = data.properties || {}
  return {
    id: data.id,
    projectName: p.projectName?.title?.[0]?.plain_text ?? "",
    description: p.description?.rich_text?.[0]?.plain_text ?? "",
    cover: data.cover?.external?.url || data.cover?.file?.url || "",
    tags: p.tag?.multi_select ?? [],
    url: p.github?.url || "",
    startDate: p.workPeriod?.date?.start || "",
    endDate: p.workPeriod?.date?.end || "",
    status: p.status?.status?.name === "Done",
    impact: p.impact?.rich_text?.[0]?.plain_text ?? "",
    role: p.role?.rich_text?.[0]?.plain_text ?? "",
    teamSize: p.teamSize?.rich_text?.[0]?.plain_text ?? "",
    liveUrl: p.liveUrl?.url || "",
    group: p.group?.select?.name ?? "",
    groupSummary: p.groupSummary?.rich_text?.[0]?.plain_text ?? "",
  }
}

// 대분류 이름 → 깔끔한 ascii slug. 미등록 그룹은 인코딩으로 폴백.
const GROUP_SLUGS: Record<string, string> = {
  "CloudHospital.Api 백엔드": "cloudhospital-api",
  "Omni 메시징 백엔드": "omni",
  "EhrApi 이벤트 백엔드": "ehrapi",
}
function groupSlug(name: string): string {
  return GROUP_SLUGS[name] ?? encodeURIComponent(name)
}

function normDate(s?: string): string {
  return (s || "").replace(/\./g, "-")
}

// 경험 목록을 대분류(프로젝트) 그룹으로 묶는다.
// group 이 있으면 같은 group 끼리, 없으면 그 경험이 독립 프로젝트가 된다.
function buildGroups(exps: Experience[]): ProjectGroup[] {
  const map = new Map<string, Experience[]>()
  const order: string[] = []
  for (const e of exps) {
    const key = e.group ? `g:${e.group}` : `s:${e.id}`
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(e)
  }

  const groups: ProjectGroup[] = order.map((key) => {
    const items = map.get(key)!
    // 경험은 최신 시작일 순으로
    items.sort((a, b) => normDate(b.startDate).localeCompare(normDate(a.startDate)))
    const grouped = key.startsWith("g:")
    const name = grouped ? items[0].group! : items[0].projectName
    const slug = grouped ? groupSlug(items[0].group!) : items[0].id
    const summary =
      items.find((e) => e.groupSummary?.trim())?.groupSummary?.trim() ||
      (items.length === 1 ? items[0].description : "")

    // 태그 union (이름 기준 dedupe)
    const tags: ProjectTag[] = []
    const seen = new Set<string>()
    for (const e of items) {
      for (const t of e.tags) {
        if (!seen.has(t.name)) {
          seen.add(t.name)
          tags.push(t)
        }
      }
    }

    const starts = items.map((e) => normDate(e.startDate)).filter(Boolean).sort()
    const ends = items.map((e) => normDate(e.endDate)).filter(Boolean).sort()
    const inProgress = items.some((e) => !e.status)
    const cover = items.find((e) => e.cover)?.cover || ""

    return {
      slug,
      name,
      summary,
      cover,
      tags,
      startDate: starts[0] || "",
      endDate: inProgress ? "" : ends[ends.length - 1] || "",
      inProgress,
      count: items.length,
      experiences: items,
    }
  })

  // 대분류는 최신 시작일 순으로(최근 백엔드 프로젝트가 먼저)
  groups.sort((a, b) => normDate(b.startDate).localeCompare(normDate(a.startDate)))
  return groups
}

function notionHeaders() {
  return {
    accept: "application/json",
    "Notion-Version": "2022-06-28",
    "content-type": "application/json",
    Authorization: `Bearer ${TOKEN}`,
  }
}

// 라이브 Notion 경험(행) 전체. 토큰/DB 미설정·실패·빈 결과면 fallback.
async function getExperiences(): Promise<Experience[]> {
  if (!TOKEN || !DATABASE_ID) {
    return fallbackExperiences
  }

  const options = {
    method: "POST",
    headers: notionHeaders(),
    body: JSON.stringify({
      sorts: [{ property: "projectName", direction: "ascending" }],
      page_size: 100,
    }),
    next: { revalidate: 3600 },
  }

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      options
    )
    if (!res.ok) throw new Error(`Notion API ${res.status}`)
    const data = (await res.json()) as NotionQueryResponse
    const exps = (data.results || []).map(mapExperience)
    if (exps.length === 0) return fallbackExperiences
    return exps
  } catch (e) {
    console.error("[projects] Notion fetch failed:", (e as Error).message)
    return fallbackExperiences
  }
}

// 목록/홈용: 대분류(프로젝트) 그룹 목록 (본문 미포함).
export async function getProjectGroups(): Promise<ProjectGroup[]> {
  const exps = await getExperiences()
  return buildGroups(exps)
}

// 상세용: slug 로 대분류 1건 + 각 경험의 본문을 채워서 반환.
export async function getProjectGroup(
  slug: string
): Promise<ProjectGroup | null> {
  const groups = await getProjectGroups()
  const group = groups.find((g) => g.slug === slug)
  if (!group) return null
  await Promise.all(
    group.experiences.map(async (e) => {
      try {
        e.body = await fetchBody(e.id)
      } catch {
        e.body = []
      }
    })
  )
  return group
}
