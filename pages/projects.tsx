import type { GetStaticProps, InferGetStaticPropsType } from "next"
import Layout from "../components/layout"
import ProjectItem, { type Project } from "../components/projects/projectItem";
import { TOKEN, DATABASE_ID } from "../config/index"

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

export default function Projects({
  ProjectArr,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout title="Projects — Sejune Oh">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Projects</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">프로젝트</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {ProjectArr.length > 0
            ? `총 ${ProjectArr.length}개의 프로젝트`
            : "프로젝트 데이터를 불러오는 중입니다."}
        </p>
      </header>

      {ProjectArr.length > 0 ? (
        <div className="gap-8 sm:columns-2 xl:columns-3">
          {ProjectArr.map((item) => (
            <ProjectItem key={item.id} data={item} />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-muted">
          표시할 프로젝트가 없습니다. (Notion 연동 시 자동 표시)
        </div>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<{ ProjectArr: Project[] }> = async () => {
  // 토큰/DB가 없거나 요청이 실패해도 빌드가 깨지지 않도록 방어적으로 처리
  if (!TOKEN || !DATABASE_ID) {
    return { props: { ProjectArr: [] } };
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
  };

  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      options
    );
    if (!res.ok) throw new Error(`Notion API ${res.status}`);
    const projects = (await res.json()) as NotionQueryResponse;

    const ProjectArr: Project[] = (projects.results || []).map((data) => {
      const p = data.properties || {};
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
      };
    });

    return { props: { ProjectArr }, revalidate: 3600 };
  } catch (e) {
    console.error("[projects] Notion fetch failed:", (e as Error).message);
    return { props: { ProjectArr: [] }, revalidate: 300 };
  }
}
