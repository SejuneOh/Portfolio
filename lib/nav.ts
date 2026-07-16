// 사이드바(데스크톱)와 모바일 헤더가 공유하는 주 내비 항목.
export interface NavItem {
  href: string
  label: string
}

export const NAV: NavItem[] = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/blog", label: "BLOG" },
  { href: "/resume", label: "RESUME" },
  { href: "/contact", label: "CONTACT" },
]

// 활성 경로 판정(홈은 정확히 일치, 그 외는 prefix).
export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
