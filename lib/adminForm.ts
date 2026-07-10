// 관리자 서버 액션들이 공유하는 순수 헬퍼 + 인증 가드.
// ("use server" 파일은 async 함수만 export 할 수 있어 헬퍼는 여기 둔다.)
import { auth } from "@/auth"

export interface ActionState {
  ok: boolean
  message: string
}

export function parseTags(raw: string): string[] {
  return (raw || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// 모든 쓰기 액션은 세션을 재확인한다(미들웨어에 더해 방어). 통과 시 null.
export async function requireOwner(): Promise<string | null> {
  const session = await auth()
  return session?.user ? null : "인증이 필요합니다. 다시 로그인하세요."
}
