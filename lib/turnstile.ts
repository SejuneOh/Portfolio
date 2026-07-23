// Cloudflare Turnstile 서버 검증. TURNSTILE_SECRET_KEY 미설정 시 검증을 건너뛴다
// (키 없으면 기존 동작 유지 — notify.ts 와 동일한 graceful degrade 패턴).
// 키가 설정된 경우에만 실제 방어가 활성화된다.
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // 미설정 → skip
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set("remoteip", ip)
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    })
    const data = (await res.json().catch(() => ({}))) as { success?: boolean }
    return data.success === true
  } catch (e) {
    console.error("[turnstile] 검증 오류:", (e as Error).message)
    return false // 검증 호출 실패 시 보수적으로 거부(키가 켜진 경우에만 도달)
  }
}
