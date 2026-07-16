// 사이트 라우트 로딩 스켈레톤 — 데이터 fetch 동안 빈 화면 대신 노출된다.
export default function SiteLoading() {
  return (
    <div className="animate-pulse py-2" aria-hidden>
      <div className="h-3 w-24 rounded bg-surface" />
      <div className="mt-6 h-9 w-2/3 rounded-lg bg-surface" />
      <div className="mt-4 h-4 w-full rounded bg-surface" />
      <div className="mt-2.5 h-4 w-5/6 rounded bg-surface" />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-line bg-surface" />
        ))}
      </div>
      <span className="sr-only">불러오는 중…</span>
    </div>
  )
}
