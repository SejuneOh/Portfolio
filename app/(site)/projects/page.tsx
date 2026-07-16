import ProjectItem from "../../../components/projects/projectItem"
import { getProjectGroups } from "../../../lib/notion"

export const metadata = { title: "Projects" }
export const revalidate = 3600

export default async function Projects() {
  const groups = await getProjectGroups()

  return (
    <>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Projects</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">프로젝트</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {groups.length > 0
            ? `총 ${groups.length}개의 프로젝트`
            : "프로젝트 데이터를 불러오는 중입니다."}
        </p>
      </header>

      {groups.length > 0 ? (
        <div className="gap-8 sm:columns-2 xl:columns-3">
          {groups.map((g) => (
            <ProjectItem key={g.slug} data={g} />
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
