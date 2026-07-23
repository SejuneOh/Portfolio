import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProjectGroups, getProjectGroup } from "../../../../lib/notion"
import type { Experience } from "../../../../components/projects/projectItem"
import PostBody from "../../../../components/postBody"
import { SITE_URL } from "../../../../lib/site"

export const revalidate = 3600

export async function generateStaticParams() {
  const groups = await getProjectGroups()
  return groups.map((g) => ({ id: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const group = await getProjectGroup(id)
  if (!group) return {}
  const url = `${SITE_URL}/projects/${id}`
  const desc = group.summary || group.experiences[0]?.impact || undefined
  return {
    title: group.name,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: group.name, description: desc },
  }
}

// "2024-09-01" / "2024.09" → "2024.09"
function fmt(d?: string) {
  if (!d) return ""
  const [y, m] = d.replace(/\./g, "-").split("-")
  return m ? `${y}.${m}` : y
}

function periodOf(e: Experience) {
  return [fmt(e.startDate), e.status ? fmt(e.endDate) : "현재"]
    .filter(Boolean)
    .join(" — ")
}

const CTA_LIVE =
  "inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent/40"
const CTA_REPO =
  "inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent/30"

function Cta({ e }: { e: Experience }) {
  if (!e.url && !e.liveUrl) return null
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {e.liveUrl && (
        <a href={e.liveUrl} target="_blank" rel="noopener noreferrer" className={CTA_LIVE}>
          라이브 데모 ↗
        </a>
      )}
      {e.url && (
        <a href={e.url} target="_blank" rel="noopener noreferrer" className={CTA_REPO}>
          Repository ↗
        </a>
      )}
    </div>
  )
}

// 경험 단위 메타(역할·팀·기간·스택) 카드.
function ExperienceMeta({ e }: { e: Experience }) {
  const period = periodOf(e)
  const rows = [
    e.role?.trim() && { label: "역할", value: e.role.trim() },
    e.teamSize?.trim() && { label: "팀", value: e.teamSize.trim() },
    period && { label: "기간", value: period },
  ].filter(Boolean) as { label: string; value: string }[]
  if (rows.length === 0 && e.tags.length === 0) return null
  return (
    <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-0.5">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">{r.label}</dt>
          <dd className="text-sm text-fg">{r.value}</dd>
        </div>
      ))}
      {e.tags.length > 0 && (
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">스택</dt>
          <dd className="flex flex-wrap gap-1.5">
            {e.tags.map((t) => (
              <span key={t.id} className="chip">
                {t.name}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  )
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const group = await getProjectGroup(id)
  if (!group) notFound()

  const multi = group.count > 1
  const lead = group.experiences[0]
  const groupPeriod = [fmt(group.startDate), group.inProgress ? "현재" : fmt(group.endDate)]
    .filter(Boolean)
    .join(" — ")

  // 단일 경험: 히어로 리드 = 경험 임팩트(없으면 개요), 서브 = 설명.
  const heroLead = multi ? group.summary : lead?.impact?.trim() || group.summary
  const heroSub = multi ? "" : lead?.description?.trim()

  return (
    <article className="max-w-[760px]">
      <Link href="/projects" className="font-mono text-xs text-muted hover:text-accent">
        ← Projects
      </Link>

      {/* Hero cover (선택) */}
      {group.cover && (
        <div className="relative mt-6 aspect-2/1 w-full overflow-hidden rounded-xl border border-line">
          <Image
            src={group.cover}
            alt=""
            fill
            sizes="760px"
            unoptimized
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Group hero */}
      <header className="mt-6">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-widest ${
            group.inProgress ? "border-accent/40 text-accent" : "border-line text-muted"
          }`}
        >
          <span aria-hidden>{group.inProgress ? "●" : "○"}</span>
          {group.inProgress ? "진행 중" : "완료"}
        </span>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
          {group.name}
        </h1>

        {heroLead && (
          <p className="mt-4 text-lg font-medium leading-relaxed text-fg">{heroLead}</p>
        )}
        {heroSub && heroSub !== heroLead && (
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{heroSub}</p>
        )}

        {!multi && lead && <Cta e={lead} />}
      </header>

      {multi ? (
        <>
          {/* 대분류 종합 메타 */}
          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
            {groupPeriod && (
              <div className="flex flex-col gap-0.5">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">기간</dt>
                <dd className="text-sm text-fg">{groupPeriod}</dd>
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">경험</dt>
              <dd className="text-sm text-fg">{group.count}건</dd>
            </div>
            {group.tags.length > 0 && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">스택</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {group.tags.map((t) => (
                    <span key={t.id} className="chip">
                      {t.name}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          {/* 경험 스택 */}
          {group.experiences.map((e, i) => (
            <section key={e.id} className="mt-12 border-t border-line pt-8">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                경험 {i + 1}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-fg">{e.projectName}</h2>
              {e.impact?.trim() && (
                <p className="mt-3 text-[15px] font-medium leading-relaxed text-fg">
                  {e.impact.trim()}
                </p>
              )}
              {e.description?.trim() && e.description.trim() !== e.impact?.trim() && (
                <p className="mt-2 text-sm leading-relaxed text-muted">{e.description.trim()}</p>
              )}
              <ExperienceMeta e={e} />
              <Cta e={e} />
              {e.body && e.body.length > 0 && (
                <div className="mt-8">
                  <PostBody blocks={e.body} />
                </div>
              )}
            </section>
          ))}
        </>
      ) : (
        lead && (
          <>
            <ExperienceMeta e={lead} />
            {lead.body && lead.body.length > 0 && (
              <div className="mt-10 border-t border-line pt-2">
                <PostBody blocks={lead.body} />
              </div>
            )}
          </>
        )
      )}

      {/* Footer nav */}
      <nav className="mt-14 flex items-center justify-between border-t border-line pt-6 text-sm">
        <Link href="/projects" className="text-muted transition-colors hover:text-accent">
          ← 전체 프로젝트
        </Link>
        <Link href="/contact" className="text-accent transition-colors hover:text-accent-hover">
          함께 일하기 →
        </Link>
      </nav>
    </article>
  )
}
