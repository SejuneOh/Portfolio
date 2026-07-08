"use client"

import { useState, useEffect } from "react"

interface TocItem {
  id: string
  text: string
}

/* 오른쪽 sticky 목차 + 스크롤 스파이 */
export default function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

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

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-14 border-l border-line pl-4 text-sm">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">목차</p>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={`block leading-snug transition-colors ${
                  active === it.id ? "text-accent" : "text-muted hover:text-fg"
                }`}
              >
                {it.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
