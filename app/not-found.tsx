import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1240px] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface"
      >
        홈으로
      </Link>
    </div>
  )
}
