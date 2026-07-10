import type { Metadata } from "next"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import ProjectForm from "../../components/admin/projectForm"
import { getInquiries } from "../../lib/inquiries"
import { getAdminPosts } from "../../lib/postsData"

// 검색엔진 비노출(민감 관리 페이지). 미들웨어가 접근 자체를 인증으로 막지만,
// 색인/링크 노출도 이중으로 차단한다.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

// 세션 기반이라 정적 프리렌더 대상이 아님을 명시(빌드 시 실행 회피).
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  const name = session?.user?.name ?? "관리자"
  const [inquiries, posts] = await Promise.all([getInquiries(), getAdminPosts()])
  const published = posts.filter((p) => p.published).length

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Admin</p>
      <h1 className="mt-3 text-2xl font-semibold text-fg">콘텐츠 관리</h1>
      <p className="mt-2 text-sm text-muted">{name}님으로 로그인됨.</p>

      {/* 블로그 백오피스 진입 */}
      <Link
        href="/admin/blog"
        className="card mt-8 flex items-center justify-between p-5 transition-colors hover:bg-surface-hover"
      >
        <div>
          <h2 className="text-base font-semibold text-fg">블로그 관리</h2>
          <p className="mt-1 text-sm text-muted">
            글 작성·수정·삭제·발행 · 총 {posts.length}개 (발행 {published})
          </p>
        </div>
        <span className="text-accent">→</span>
      </Link>

      {/* 프로젝트 등록 */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-fg">프로젝트 등록</h2>
        <ProjectForm />
      </section>

      {/* 접수된 문의 목록 */}
      <section className="mt-14">
        <h2 className="text-lg font-semibold text-fg">
          문의 <span className="font-mono text-sm text-muted">({inquiries.length})</span>
        </h2>
        {inquiries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            아직 접수된 문의가 없습니다. (NOTION_INQUIRIES_DB 미설정 시에도 비어 있음)
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {inquiries.map((q) => (
              <li key={q.id} className="py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-fg">{q.name || "이름 없음"}</span>
                    {q.type && <span className="chip">{q.type}</span>}
                  </div>
                  <time className="font-mono text-xs text-muted">{q.createdTime.slice(0, 10)}</time>
                </div>
                {q.email && (
                  <a href={`mailto:${q.email}`} className="mt-1 block font-mono text-xs text-accent hover:underline">
                    {q.email}
                  </a>
                )}
                {q.message && <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{q.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/" })
        }}
        className="mt-10"
      >
        <button type="submit" className="link-underline text-sm text-muted">
          로그아웃 →
        </button>
      </form>
    </main>
  )
}
