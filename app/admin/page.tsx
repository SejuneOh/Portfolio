import type { Metadata } from "next"
import { auth, signOut } from "@/auth"
import AdminForms from "../../components/admin/adminForms"

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

  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Admin</p>
      <h1 className="mt-3 text-2xl font-semibold text-fg">콘텐츠 관리</h1>
      <p className="mt-2 text-sm text-muted">
        {name}님으로 로그인됨. 블로그·프로젝트를 Notion 에 직접 등록할 수 있습니다.
      </p>

      <AdminForms />

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
