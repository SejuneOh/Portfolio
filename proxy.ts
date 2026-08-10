// 프록시 2역할 (Next 16 에서 middleware 규약이 proxy 로 바뀌었다 — #102):
//  1) /api/auth/* (로그인·콜백·세션) 레이트리밋 — auth 엔드포인트 남용/무차별 완화.
//     Upstash 설정 시 내구성, 미설정 시 in-memory 폴백(lib/rateLimit.ts).
//  2) /admin/* 인증 강제 — 미인증 접근은 NextAuth 로그인 페이지로 리다이렉트.
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { rateLimit } from "@/lib/rateLimit"

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // 1) auth 엔드포인트 레이트리밋: IP당 1분 20회. OAuth 플로우(리다이렉트·콜백·세션
  //    폴링)는 정상 사용 시 이 한도에 닿지 않음 → 남용 트래픽만 429 로 차단.
  if (pathname.startsWith("/api/auth")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    if (!(await rateLimit(`auth:${ip}`, 20, 60 * 1000))) {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
    return NextResponse.next()
  }

  // 2) /admin 보호: 미인증이면 로그인으로(원래 경로를 callbackUrl 로 보존).
  if (pathname.startsWith("/admin") && !req.auth?.user) {
    const url = req.nextUrl.clone()
    url.pathname = "/api/auth/signin"
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  // /admin 이하(인증) + /api/auth 이하(레이트리밋)만 검사. 정적 파일·이미지 제외.
  matcher: ["/admin/:path*", "/api/auth/:path*"],
}
