import Link from "next/link"
import ProjectItem from "../../components/projects/projectItem"
import AboutRail from "../../components/home/aboutRail"
import { getProjects } from "../../lib/notion"

export const revalidate = 3600

const HOME_CAP = 7

export default async function Home() {
  const projects = await getProjects()
  const homeProjects = projects.slice(0, HOME_CAP)
  const hasMore = projects.length > homeProjects.length

  return (
    <>
      {/* Masthead */}
      <section className="pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
          Backend Engineer · Fullstack
        </p>
        <h1 className="mt-3 max-w-[18ch] text-2xl font-extrabold leading-tight tracking-tight text-fg sm:text-3xl">
          실시간 채팅·메시징 백엔드를 설계·운영하는 C#/.NET 엔지니어
        </h1>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted">
          {`${projects.length}개 프로젝트 · 2019—NOW`}
        </p>
      </section>

      <div className="border-t border-line" />

      {/* 2-column split: project index + colophon rail */}
      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
        {/* LEFT: project index */}
        <div className="lg:order-first">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {homeProjects.map((p, i) =>
              i === 0 ? (
                <div key={p.id} className="sm:col-span-2">
                  <ProjectItem data={p} />
                </div>
              ) : (
                <ProjectItem key={p.id} data={p} />
              )
            )}
          </div>

          {hasMore && (
            <div className="mt-4">
              <Link href="/projects" className="link-underline text-sm">
                전체 보기 →
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT: colophon rail (above index on mobile) */}
        <div className="mb-10 order-first lg:order-last lg:mb-0">
          <AboutRail />
        </div>
      </div>
    </>
  )
}
