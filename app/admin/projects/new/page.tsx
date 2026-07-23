import type { Metadata } from "next"
import Link from "next/link"
import ProjectForm from "../../../../components/admin/projectForm"

export const metadata: Metadata = {
  title: "새 프로젝트",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"
export const maxDuration = 60

export default function NewProject() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <Link href="/admin/projects" className="font-mono text-xs text-muted hover:text-accent">
        ← 프로젝트
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-semibold text-fg">새 프로젝트</h1>
      <ProjectForm />
    </main>
  )
}
