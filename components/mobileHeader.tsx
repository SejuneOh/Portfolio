"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NAV, isNavActive } from "../lib/nav"
import DarkModeToggleBtn from "./darkModeToggleBtn"

// 모바일(md 미만) 전용 상단 바 + 햄버거 드로어.
// 데스크톱에서는 렌더 자체를 숨긴다(md:hidden). 사이드바가 데스크톱을 담당.
export default function MobileHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // 라우트 변경 시 닫기
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 열렸을 때: body 스크롤 잠금 + Esc 로 닫기
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div className="md:hidden">
      {/* 상단 바 */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-page/90 py-3 backdrop-blur-sm">
        <Link href="/" aria-label="home" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center bg-accent text-[11px] font-extrabold text-white">
            SO
          </span>
          <span className="text-sm font-bold tracking-wide text-fg">SEJUNE OH</span>
        </Link>
        <div className="flex items-center gap-1">
          <DarkModeToggleBtn />
          <button
            type="button"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg transition-colors hover:text-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* 드로어 오버레이 */}
      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-l border-line bg-page p-6 shadow-xl">
            <span className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Menu</span>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`py-2 text-lg font-bold tracking-wide transition-colors ${
                  isNavActive(pathname, n.href) ? "text-accent" : "text-fg hover:text-accent"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-auto space-y-1.5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
              <p>Email. etry0715@gmail.com</p>
              <p>GitHub. github.com/SejuneOh</p>
              <p>Location. Seoul, Korea</p>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
