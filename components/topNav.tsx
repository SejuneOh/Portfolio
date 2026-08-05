"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV, CONTACT, isNavActive } from "../lib/nav"

// 사이드바에서 옮겨 온 아이콘. 사이드바 삭제와 함께 잃지 않도록 여기서 계속 쓴다.
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}

/*
  데스크톱(md+) 상단 내비. 모바일은 MobileHeader 가 담당한다.

  3슬롯 그리드(1fr auto 1fr)를 쓴다. flex + space-between 을 쓰면 우측 Contact 버튼이
  없는 Contact 페이지에서 내비가 오른쪽으로 밀린다. 양쪽 1fr 이 같은 폭을 차지하므로
  가운데 슬롯은 슬롯 내용과 무관하게 항상 화면 중앙에 놓인다.
*/
export default function TopNav() {
  const pathname = usePathname()

  // Contact 페이지에서는 우측 버튼을 없애고 필 내비의 다섯 번째 항목으로 옮긴다.
  const onContact = isNavActive(pathname, CONTACT.href)
  const items = onContact ? [...NAV, CONTACT] : NAV

  return (
    <nav className="hidden grid-cols-[1fr_auto_1fr] items-center py-1 md:grid print:hidden">
      {/* 좌 — 로고 */}
      <Link href="/" aria-label="home" className="w-fit">
        <span className="font-logo text-[21px] font-bold leading-none tracking-tight text-ink">
          SEJUNE<span className="text-lime">.</span>DEV
        </span>
      </Link>

      {/* 중앙 — 필 내비 */}
      <ul className="flex list-none items-center gap-1 justify-self-center rounded-full border border-line px-2.5 py-[7px]">
        {items.map((n) => {
          const active = isNavActive(pathname, n.href)
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "pill-nav-item bg-lime font-semibold text-[color:var(--lime-ink)] hover:bg-[#CDEA55]"
                    : "pill-nav-item text-fg hover:bg-surface-hover"
                }
              >
                {n.label}
              </Link>
            </li>
          )
        })}
      </ul>

      {/*
        우 — GitHub + Contact 버튼.
        Contact 페이지에서는 버튼을 렌더하지 않는다. 슬롯 자체는 남으므로
        가운데 내비 위치는 모든 페이지에서 같다.
      */}
      <div className="flex items-center gap-3 justify-self-end">
        <a
          href="https://github.com/SejuneOh"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted transition-colors hover:text-fg"
        >
          <GitHubIcon />
        </a>
        {!onContact && (
          <Link
            href={CONTACT.href}
            className="pill-nav-item bg-lime font-semibold text-[color:var(--lime-ink)] hover:bg-[#CDEA55]"
          >
            {CONTACT.label}
          </Link>
        )}
      </div>
    </nav>
  )
}
