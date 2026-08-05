"use client"

import { useState, useEffect } from "react"

interface TocItem {
  id: string
  text: string
}

/*
  목차 + 스크롤 스파이.

  스크롤 추적은 기존 IntersectionObserver 를 그대로 두고 활성 스타일만 바꿨다.
  새로 추가한 클라이언트 상태는 **모바일 접힘 하나뿐**이다 — 데스크톱에서는
  항상 펼쳐져 있고 접기 버튼도 없다.
*/
export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    )
    els.forEach((el) => ob.observe(el))
    return () => ob.disconnect()
  }, [items])

  if (items.length < 2) return null

  const list = (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.id}>
          <a
            href={`#${it.id}`}
            className={`block text-[13px] leading-snug transition-colors ${
              active === it.id ? "font-semibold text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {it.text}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <aside>
      {/* 모바일 — 접힌 상태로 시작한다 */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 rounded-[12px] border border-line px-4 py-2.5 text-left"
        >
          <span className="eyebrow text-muted">목차 {items.length}개</span>
          <span className="eyebrow text-muted">{open ? "접기 ▴" : "펼치기 ▾"}</span>
        </button>
        {open && <div className="mt-3 border-l-2 border-line pl-[18px]">{list}</div>}
      </div>

      {/* 데스크톱 — sticky 로 따라온다 */}
      <nav className="hidden lg:sticky lg:top-6 lg:block lg:self-start lg:border-l-2 lg:border-line lg:pl-[18px]">
        <p className="eyebrow mb-3 text-muted">목차</p>
        {list}
      </nav>
    </aside>
  )
}
