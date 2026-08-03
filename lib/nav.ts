// 상단 필 내비(데스크톱)와 모바일 헤더가 공유하는 주 내비 항목.
export interface NavItem {
  href: string
  label: string
}

// 4축 구조. 경로는 아직 기존 값을 쓴다 — /projects → /work, /blog → /writing 이동과
// /resume → /about 흡수는 각각 별도 작업이므로, 여기서는 라벨만 새 이름으로 둔다.
export const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "About" },
]

// Contact는 주 내비가 아니라 액션이다. 데스크톱에서는 우측 버튼으로 렌더하고,
// Contact 페이지에서만 버튼을 없애고 필 내비의 다섯 번째 항목으로 옮긴다.
// 모바일 드로어는 버튼 자리가 없으므로 주 내비와 함께 나열한다.
export const CONTACT: NavItem = { href: "/contact", label: "Contact" }

// 활성 경로 판정(홈은 정확히 일치, 그 외는 prefix).
export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
