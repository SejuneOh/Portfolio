import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import ProjectForm from "../../../../../components/admin/projectForm"
import { getAdminProject } from "../../../../../lib/notion"
import { blocksToText } from "../../../../../lib/notionWrite"

export const metadata: Metadata = {
  title: "프로젝트 수정",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"
// 본문 블록 교체(다건 Notion 호출)가 기본 10초를 넘을 수 있어 상향.
export const maxDuration = 60

export default async function EditProject({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getAdminProject(id)
  if (!project) notFound()

  const initial = {
    id: project.id,
    name: project.name,
    description: project.description,
    tags: project.tags.join(", "),
    github: project.github,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    impact: project.impact,
    role: project.role,
    teamSize: project.teamSize,
    liveUrl: project.liveUrl,
    group: project.group,
    groupSummary: project.groupSummary,
    cover: project.cover,
    body: blocksToText(project.body || []),
  }

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <Link href="/admin/projects" className="font-mono text-xs text-muted hover:text-accent">
        ← 프로젝트
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-semibold text-fg">프로젝트 수정</h1>
      <ProjectForm initial={initial} />
    </main>
  )
}
