"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NAV, CONTACT, isNavActive } from "../lib/nav"

// 모바일(md 미만) 전용 상단 바 + 햄버거 드로어.
// 데스크톱에서는 렌더 자체를 숨긴다(md:hidden). TopNav 가 데스크톱을 담당.
//
// 드로어에는 Contact 를 함께 나열한다 — 데스크톱은 우측 버튼으로 두지만
// 여기에는 버튼 자리가 없어서, 빼면 모바일에서 Contact 로 가는 경로가 사라진다.
const DRAWER_NAV = [...NAV, CONTACT]

/*
  하위 페이지에서 돌아갈 상위를 현재 경로로 판정한다.
  `/blog/어떤글` → Writing, `/projects/어떤것` → Work.
  홈은 제외하고, 경계는 `href + "/"` 로 본다 — 단순 startsWith 를 쓰면
  가정상 `/blogfoo` 같은 경로도 `/blog` 의 하위로 잡힌다.
*/
function findParent(pathname: string) {
  return DRAWER_NAV.find(
    (n) => n.href !== "/" && pathname !== n.href && pathname.startsWith(`${n.href}/`),
  )
}

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

  const parent = findParent(pathname)

  return (
    <div className="md:hidden">
      {/*
        배경은 흰 표면에 맞춘다 — 이 헤더는 표면 안에 놓이므로 세이지를 쓰면 색이 어긋난다.
        표면이 rounded-[28px] 라 고정 헤더가 상단 곡선을 덮으므로 sticky 는 쓰지 않는다.
      */}
      <header className="flex items-center justify-between border-b border-line bg-surface py-3">
        {/* 좌 — 하위 페이지면 백링크, 아니면 로고 */}
        {parent ? (
          /*
            고정폭은 JetBrains Mono(--font-jbmono)를 쓴다. Tailwind 의 font-mono 는
            기본 테마의 시스템 고정폭 스택이라 이 디자인의 고정폭이 아니다.

            색은 잉크다. 이 컴포넌트는 md:hidden 이라 hover 가 도달하지 않는 터치 환경이
            기본이고, 이 링크가 하위 페이지에서 상위로 가는 유일한 경로다.

            같은 이유로 타깃도 44px 로 잡는다. 12px 텍스트의 라인 박스는 16px 뿐이고
            header 의 py-3 은 링크의 타깃이 아니다. h-11 로 세로만 늘리므로
            헤더 높이는 햄버거(44px)가 이미 정하고 있어 변하지 않는다.
          */
          <Link
            href={parent.href}
            className="inline-flex h-11 items-center font-[family-name:var(--font-jbmono)] text-xs text-ink"
          >
            ← {parent.label}
          </Link>
        ) : (
          <Link href="/" aria-label="home">
            <span className="font-logo text-[18px] font-bold leading-none tracking-tight text-ink">
              SEJUNE<span className="text-lime">.</span>DEV
            </span>
          </Link>
        )}

        {/*
          우 — 햄버거. 보이는 원은 38px 이고, 버튼 자체를 44px 로 잡아
          터치 타깃 최소치를 채운다(38px 원만 두면 미달).
        */}
        <button
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center"
        >
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-surface-hover">
            {open ? (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </span>
        </button>
      </header>

      {/* 드로어 오버레이 — 열림 상태 관리는 기존 로직 그대로다 */}
      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col border-l border-line bg-surface p-6 shadow-xl">
            <span className="eyebrow mb-4 text-muted">Menu</span>
            {DRAWER_NAV.map((n) => {
              const active = isNavActive(pathname, n.href)
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  /*
                    활성 표시를 색이 아니라 라임 밑줄로 한다.
                    --accent 가 잉크가 되면서 text-accent 와 text-fg 가 같은 색이라
                    기존의 색 대비로는 활성 항목이 구분되지 않는다.
                  */
                  className={`w-fit py-2 text-lg font-bold tracking-wide transition-colors ${
                    active
                      ? "border-b-2 border-lime text-ink"
                      : "text-fg hover:text-muted"
                  }`}
                >
                  {n.label}
                </Link>
              )
            })}
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
