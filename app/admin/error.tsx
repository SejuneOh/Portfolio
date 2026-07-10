"use client"

// /admin 세그먼트 에러 백스톱 — 예기치 못한 오류가 나도 전역 에러 화면 대신
// 인라인 안내 + 재시도로 처리한다.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Admin</p>
      <h1 className="mt-3 text-xl font-semibold text-fg">문제가 발생했어요</h1>
      <p className="mt-2 text-sm text-muted">
        요청 처리 중 오류가 났습니다. 다시 시도하거나 목록으로 돌아가세요.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          다시 시도
        </button>
        <a href="/admin/blog" className="link-underline text-sm text-muted">
          블로그 목록으로
        </a>
      </div>
    </main>
  )
}
