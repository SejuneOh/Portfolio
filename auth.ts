import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

// 이 사이트의 /admin 은 소유자 1인(GitHub: SejuneOh)만 접근한다.
// GitHub OAuth 로 로그인하되, 아래 계정이 아니면 로그인을 거부한다.
const ALLOWED_GITHUB_LOGIN = "SejuneOh"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 세션은 DB 어댑터 없이 JWT 로 유지한다(엣지 미들웨어에서 세션 확인 가능).
  session: { strategy: "jwt" },
  providers: [GitHub],
  callbacks: {
    // GitHub 인증 성공 후, 허용된 계정만 통과시킨다.
    signIn({ profile }) {
      const login = (profile as { login?: string } | undefined)?.login
      return login === ALLOWED_GITHUB_LOGIN
    },
    // 미들웨어에서 사용: /admin 이하는 인증된 사용자만, 그 외 경로는 통과.
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/admin")) {
        return !!auth?.user
      }
      return true
    },
  },
})
