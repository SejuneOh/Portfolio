import type { Project } from "../components/projects/projectItem"
import { TOKEN, DATABASE_ID } from "../config"
import { fallbackProjects } from "./projectsFallback"

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
}
interface NotionPage {
  id: string
  properties?: NotionProperties
  cover?: { external?: { url?: string }; file?: { url?: string } }
}
interface NotionQueryResponse {
  results?: NotionPage[]
}

export async function getProjects(): Promise<Project[]> {
  // 토큰/DB가 없거나 요청이 실패해도 빌드가 깨지지 않도록 방어적으로 처리
  if (!TOKEN || !DATABASE_ID) {
    return fallbackProjects
  }

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Notion-Version": "2022-06-28",
      "content-type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
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
    const projects = (await res.json()) as NotionQueryResponse

    const ProjectArr: Project[] = (projects.results || []).map((data) => {
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
      }
    })

    // 결과가 비어 있으면 큐레이션된 대체 목록으로 폴백
    if (ProjectArr.length === 0) {
      return fallbackProjects
    }

    return ProjectArr
  } catch (e) {
    console.error("[projects] Notion fetch failed:", (e as Error).message)
    return fallbackProjects
  }
}
