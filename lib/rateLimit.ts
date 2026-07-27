// 레이트리밋: 공개 폼의 봇/스팸 남용 완화. 허니팟·Turnstile 과 함께 다층 방어.
//
// 두 가지 백엔드를 graceful-degrade 로 지원(turnstile.ts / notify.ts 와 동일 패턴):
//   1) 내구성(durable): UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN 설정 시.
//      서버리스 인스턴스·재배포를 넘어 카운트가 공유됨(고정 윈도우).
//   2) in-memory 폴백: 위 키 미설정 시. 인스턴스별·재시작 시 초기화되는 슬라이딩 윈도우.
//      키 발급 전에도 안전하게 동작(신규 의존성 0, fetch 만 사용).

// ── in-memory 슬라이딩 윈도우(폴백) ────────────────────────────────
const hits = new Map<string, number[]>()

function rateLimitMemory(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

// ── Upstash Redis REST(내구성) ─────────────────────────────────────
// 고정 윈도우: INCR 로 카운트를 올리고, 첫 히트에서만(NX) 윈도우 만료를 건다.
// 반환 count 가 max 이하이면 허용. 인스턴스를 넘어 원자적으로 동작.
async function rateLimitUpstash(
  url: string,
  token: string,
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, String(windowMs), "NX"],
    ]),
    // 레이트리밋 값은 캐시하면 안 됨.
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`upstash ${res.status}`)
  const data = (await res.json()) as Array<{ result?: number; error?: string }>
  const first = data?.[0]
  if (!first || first.error || typeof first.result !== "number") {
    throw new Error(first?.error || "upstash malformed response")
  }
  return first.result <= max
}

// 허용이면 true, 한도 초과면 false. Upstash 설정 시 내구성 백엔드, 아니면 in-memory.
// Upstash 호출 실패 시엔 가용성 우선으로 in-memory 폴백(폼이 하드 실패하지 않도록).
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    try {
      return await rateLimitUpstash(url, token, `rl:${key}`, max, windowMs)
    } catch (e) {
      console.error("[rateLimit] upstash 오류, in-memory 폴백:", (e as Error).message)
    }
  }
  return rateLimitMemory(key, max, windowMs)
}
