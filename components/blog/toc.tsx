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

  /*
    계측기 눈금. 레일(border-l)에서 짧은 선이 항목마다 뻗어 나오고, 현재 위치의
    눈금만 라임으로 길어진다 — 굵기 변화만으로 알리던 것을 눈금 위치로 바꾼 것이다.

    눈금의 left 는 레일을 감싼 쪽의 pl-[18px] 과 맞물린다. 그쪽 값을 바꾸면
    여기도 같이 바꿔야 한다.

    번호는 aria-hidden 이다. 순서는 목록 구조가 이미 전달하므로 스크린리더가
    제목마다 "영일"을 먼저 읽을 이유가 없다. 눈으로 훑을 때의 눈금 라벨이다.
  */
  const list = (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const on = active === it.id
        return (
          <li key={it.id} className="relative">
            {/*
              눈금은 폭과 색이 함께 바뀐다. transition-all 이었는데 여기서 실제로 움직이는
              것은 이 둘뿐이므로 둘만 적는다 (#227). all 로 두면 반응형 분기가 걸릴 때
              위치·여백까지 따라 움직인다 — 의도한 적 없는 움직임이다.
            */}
            <span
              aria-hidden
              className={`absolute -left-[18px] top-[0.6em] h-px transition-[width,background-color] duration-200 ${
                on ? "w-[12px] bg-lime" : "w-[6px] bg-line"
              }`}
            />
            <a
              href={`#${it.id}`}
              className={`flex gap-2 text-[13px] leading-snug transition-colors ${
                on ? "font-semibold text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <span
                aria-hidden
                className={`shrink-0 font-[family-name:var(--font-jbmono)] text-[10.5px] leading-[1.5] ${
                  on ? "text-lime" : "text-muted"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {/*
                헤딩 텍스트도 Notion 자유 문자열이다. 이 span 은 이미 min-w-0 이라
                flex 아이템이 min-content 아래로 줄어들 수 있으므로 break-words 로 충분하다 (#214).
              */}
              <span className="min-w-0 break-words">{it.text}</span>
            </a>
          </li>
        )
      })}
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
          className="flex w-full items-center justify-between gap-3 rounded-[3px] border border-line px-4 py-2.5 text-left"
        >
          <span className="eyebrow text-muted">목차 {items.length}개</span>
          <span className="eyebrow text-muted">{open ? "접기 ▴" : "펼치기 ▾"}</span>
        </button>
        {/* 레일은 1px. 눈금이 뻗어 나오는 자(尺)이므로 자보다 눈금이 굵으면 안 된다 */}
        {open && <div className="mt-3 border-l border-line pl-[18px]">{list}</div>}
      </div>

      {/* 데스크톱 — sticky 로 따라온다 */}
      <nav className="hidden lg:sticky lg:top-6 lg:block lg:self-start lg:border-l lg:border-line lg:pl-[18px]">
        <p className="eyebrow mb-3 text-muted">목차</p>
        {list}
      </nav>
    </aside>
  )
}
