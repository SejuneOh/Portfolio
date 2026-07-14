// 간단 in-memory 슬라이딩 윈도우 레이트리밋. 서버리스 인스턴스별이라 완벽하진 않지만
// 공개 폼의 기본 스팸/남용 완화용으로 충분. 허니팟과 함께 다층 방어.
const hits = new Map<string, number[]>()

// 허용이면 true, 한도 초과면 false.
export function rateLimit(key: string, max: number, windowMs: number): boolean {
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
