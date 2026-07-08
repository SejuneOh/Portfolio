import ProjectItem from "../../../components/projects/projectItem"
import { getProjects } from "../../../lib/notion"

export const metadata = { title: "Projects" }
export const revalidate = 3600

export default async function Projects() {
  const ProjectArr = await getProjects()

  return (
    <>
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
    </>
  )
}
