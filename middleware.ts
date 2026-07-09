// /admin/* 요청을 가로채 인증(authorized 콜백)을 강제한다.
// 미인증 접근은 NextAuth 기본 로그인 페이지로 리다이렉트된다.
export { auth as middleware } from "@/auth"

export const config = {
  // 정적 파일/이미지/공개 auth 엔드포인트는 제외하고 /admin 이하만 검사.
  matcher: ["/admin/:path*"],
}
