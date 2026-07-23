import type { Metadata } from "next"
import Link from "next/link"
import { getAdminProjects } from "../../../lib/notion"
import ProjectRowActions from "../../../components/admin/projectRowActions"

export const metadata: Metadata = {
  title: "프로젝트 관리",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminProjects() {
  const projects = await getAdminProjects()

  return (
    <main className="mx-auto max-w-[820px] px-6 py-16">
      <Link href="/admin" className="font-mono text-xs text-muted hover:text-accent">
        ← Admin
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-fg">
          프로젝트 <span className="font-mono text-sm text-muted">({projects.length})</span>
        </h1>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          + 새 프로젝트
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          아직 프로젝트가 없습니다. (NOTION_DB 미설정 시에도 비어 있음) — “+ 새 프로젝트”로 등록하세요.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {projects.map((p) => (
            <li key={p.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/projects/${p.id}/edit`}
                    className="text-base font-semibold text-fg hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  {p.status && (
                    <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
                      {p.status}
                    </span>
                  )}
                </div>
                <time className="shrink-0 font-mono text-xs text-muted">{p.startDate || "—"}</time>
              </div>
              {p.description && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted line-clamp-2">{p.description}</p>
              )}
              <div className="mt-2.5 flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {p.group && <span className="font-mono">{p.group}</span>}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <ProjectRowActions id={p.id} name={p.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
