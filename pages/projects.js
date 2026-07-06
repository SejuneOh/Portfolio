import Layout from "../components/layout"
import ProjectItem from "../components/projects/projectItem";
import { TOKEN, DATABASE_ID } from "../config/index"

export default function Projects({ ProjectArr }) {
  return (
    <Layout title="Projects — Sejune Oh">
      <div className="mx-auto max-w-content px-5 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Projects</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-fg sm:text-5xl">프로젝트</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          {ProjectArr.length > 0
            ? `총 ${ProjectArr.length}개의 프로젝트`
            : "프로젝트 데이터를 불러오는 중입니다."}
        </p>

        {ProjectArr.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {ProjectArr.map((item) => (
              <ProjectItem key={item.id} data={item} />
            ))}
          </div>
        ) : (
          <div className="mt-10 card p-10 text-center text-muted">
            표시할 프로젝트가 없습니다.
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
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
    const projects = await res.json();

    const ProjectArr = (projects.results || []).map((data) => {
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
    console.error("[projects] Notion fetch failed:", e.message);
    return { props: { ProjectArr: [] }, revalidate: 300 };
  }
}
