import Link from "next/link"
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
  return {
    title: project.projectName,
    description: project.description || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: project.projectName,
      description: project.description || undefined,
    },
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

  // 프로젝트 페이지 본문(케이스스터디). fallback/미설정 등으로 없으면 빈 배열.
  let body: Block[] = []
  try {
    body = await fetchBody(id)
  } catch {
    body = []
  }

  const period = [project.startDate, project.endDate].filter(Boolean).join(" — ")

  return (
    <div className="max-w-[720px]">
      <Link href="/projects" className="font-mono text-xs text-muted hover:text-accent">
        ← Projects
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-accent">
        {period && <span>{period}</span>}
        {project.status && (
          <>
            {period && <span className="text-muted">·</span>}
            <span>완료</span>
          </>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
        {project.projectName}
      </h1>

      {project.description && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{project.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t.id} className="chip">
            {t.name}
          </span>
        ))}
      </div>

      {project.url && (
        <div className="mt-5">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-sm text-accent"
          >
            GitHub / 링크 →
          </a>
        </div>
      )}

      {body.length > 0 && (
        <div className="mt-8 border-t border-line pt-2">
          <PostBody blocks={body} />
        </div>
      )}
    </div>
  )
}
