// 상단 라벨 바(데스크톱)와 모바일 헤더가 공유하는 주 내비 항목.
export interface NavItem {
  href: string
  label: string
}

// 4축 구조. /projects → /work, /blog → /writing 이동은 반영됐고,
// /resume 는 /about/resume 로 흡수됐다.
export const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
]

// Contact는 주 내비가 아니라 액션이다. 데스크톱에서는 우측 버튼으로 렌더하고,
// Contact 페이지에서만 버튼을 없애고 라벨 바의 다섯 번째 항목으로 옮긴다.
// (#180 에서 필 내비가 계측 라벨 바로 바뀌었다. topNav.tsx 는 그때 고쳤고 여기가 남았다)
// 모바일 드로어는 버튼 자리가 없으므로 주 내비와 함께 나열한다.
export const CONTACT: NavItem = { href: "/contact", label: "Contact" }

// 활성 경로 판정(홈은 정확히 일치, 그 외는 prefix).
export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
