import type { Metadata } from "next"
import Link from "next/link"
import { getAdminPosts } from "../../../lib/postsData"
import BlogRowActions from "../../../components/admin/blogRowActions"

export const metadata: Metadata = {
  title: "블로그 관리",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminBlog() {
  const posts = await getAdminPosts()

  return (
    <main className="mx-auto max-w-[820px] px-6 py-16">
      <Link href="/admin" className="font-mono text-xs text-muted hover:text-accent">
        ← Admin
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-fg">
          블로그 <span className="font-mono text-sm text-muted">({posts.length})</span>
        </h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          + 새 글
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          아직 글이 없습니다. (NOTION_BLOG_DB 미설정 시에도 비어 있음) — “+ 새 글”로 작성하세요.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {posts.map((p) => (
            <li key={p.id} className="py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      p.published ? "bg-accent" : "bg-line"
                    }`}
                    title={p.published ? "발행됨" : "초안"}
                  />
                  <Link
                    href={`/admin/blog/${p.id}/edit`}
                    className="text-base font-semibold text-fg hover:text-accent"
                  >
                    {p.title}
                  </Link>
                  {!p.published && (
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
                      draft
                    </span>
                  )}
                </div>
                <time className="shrink-0 font-mono text-xs text-muted">{p.date || "—"}</time>
              </div>
              {p.summary && <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.summary}</p>}
              <div className="mt-2.5 flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  {p.category && <span className="font-mono">{p.category}</span>}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <BlogRowActions id={p.id} title={p.title} published={p.published} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
