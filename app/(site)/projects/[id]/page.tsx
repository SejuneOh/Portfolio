import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProjects, getProject } from "../../../../lib/notion"
import { fetchBody } from "../../../../lib/postsData"
import type { Block } from "../../../../lib/posts"
import PostBody from "../../../../components/postBody"
import { SITE_URL } from "../../../../lib/site"

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const project = await getProject(id)
  if (!project) return {}
  const url = `${SITE_URL}/projects/${id}`
  const desc = project.impact || project.description || undefined
  return {
    title: project.projectName,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: project.projectName, description: desc },
  }
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  // 케이스스터디 본문(문제/접근/아키텍처/결과). 미설정 시 빈 배열 → 히어로+메타만 노출.
  let body: Block[] = []
  try {
    body = await fetchBody(id)
  } catch {
    body = []
  }

  const period = [project.startDate, project.endDate].filter(Boolean).join(" — ")
  const statusLabel = project.status ? "완료" : "진행 중"
  const hook = project.impact?.trim()
  const desc = project.description?.trim()

  const metaRows = [
    project.role?.trim() && { label: "역할", value: project.role.trim() },
    project.teamSize?.trim() && { label: "팀", value: project.teamSize.trim() },
    period && { label: "기간", value: period },
  ].filter(Boolean) as { label: string; value: string }[]

  const hasMeta = metaRows.length > 0 || project.tags.length > 0

  return (
    <article className="max-w-[760px]">
      <Link href="/projects" className="font-mono text-xs text-muted hover:text-accent">
        ← Projects
      </Link>

      {/* Hero cover (선택) */}
      {project.cover && (
        <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-xl border border-line">
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="760px"
            unoptimized
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Hero */}
      <header className="mt-6">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-widest ${
            project.status ? "border-line text-muted" : "border-accent/40 text-accent"
          }`}
        >
          <span aria-hidden>{project.status ? "○" : "●"}</span>
          {statusLabel}
        </span>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
          {project.projectName}
        </h1>

        {/* 임팩트 한 줄(3초 훅). 없으면 설명이 리드 역할. */}
        {hook ? (
          <>
            <p className="mt-4 text-lg font-medium leading-relaxed text-fg">{hook}</p>
            {desc && <p className="mt-2 text-[15px] leading-relaxed text-muted">{desc}</p>}
          </>
        ) : (
          desc && <p className="mt-4 text-lg leading-relaxed text-muted">{desc}</p>
        )}

        {/* CTA */}
        {(project.url || project.liveUrl) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                라이브 데모 ↗
              </a>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                Repository ↗
              </a>
            )}
          </div>
        )}
      </header>

      {/* At-a-glance 메타 */}
      {hasMeta && (
        <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2">
          {metaRows.map((r) => (
            <div key={r.label} className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {r.label}
              </dt>
              <dd className="text-sm text-fg">{r.value}</dd>
            </div>
          ))}
          {project.tags.length > 0 && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-muted">스택</dt>
              <dd className="flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span key={t.id} className="chip">
                    {t.name}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* 케이스스터디 본문 */}
      {body.length > 0 && (
        <div className="mt-10 border-t border-line pt-2">
          <PostBody blocks={body} />
        </div>
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
