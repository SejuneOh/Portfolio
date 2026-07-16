import Link from "next/link"
import ProjectItem from "../../components/projects/projectItem"
import AboutRail from "../../components/home/aboutRail"
import { getProjectGroups } from "../../lib/notion"
import JsonLd from "../../components/jsonLd"
import { SITE_URL, SITE_DESCRIPTION, AUTHOR } from "../../lib/site"

export const revalidate = 3600

const HOME_CAP = 7

export default async function Home() {
  const groups = await getProjectGroups()
  const homeGroups = groups.slice(0, HOME_CAP)
  const hasMore = groups.length > homeGroups.length

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: AUTHOR.name,
          alternateName: AUTHOR.alternateName,
          jobTitle: AUTHOR.jobTitle,
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          sameAs: AUTHOR.sameAs,
        }}
      />
      {/* Masthead */}
      <section className="pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
          Backend Engineer · Fullstack
        </p>
        <h1 className="mt-3 max-w-[18ch] text-2xl font-extrabold leading-tight tracking-tight text-fg sm:text-3xl">
          실시간 채팅·메시징 백엔드를 설계·운영하는 C#/.NET 엔지니어
        </h1>
        <p className="mt-3 font-mono text-xs tracking-widest text-muted">
          {`${groups.length}개 프로젝트 · 2019—NOW`}
        </p>
      </section>

      <div className="border-t border-line" />

      {/* 2-column split: project index + colophon rail */}
      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
        {/* LEFT: project index */}
        <div className="lg:order-first">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {homeGroups.map((g, i) =>
              i === 0 ? (
                <div key={g.slug} className="sm:col-span-2">
                  <ProjectItem data={g} />
                </div>
              ) : (
                <ProjectItem key={g.slug} data={g} />
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
