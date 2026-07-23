"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 서버/렌더 예외를 콘솔에 남겨 디버깅을 돕는다.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Error</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        문제가 발생했습니다
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        페이지를 불러오는 중 오류가 났어요. 잠시 후 다시 시도해 주세요.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface"
        >
          홈으로
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-[11px] text-muted/70">ref: {error.digest}</p>
      )}
    </div>
  )
}
