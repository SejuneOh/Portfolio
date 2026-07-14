// 새 문의 발생 시 소유자에게 이메일 알림(Resend). 서버에서만 호출.
// RESEND_API_KEY / CONTACT_NOTIFY_EMAIL 미설정 시 조용히 skip(저장은 그대로 진행).
// 알림 실패가 제출 흐름을 깨지 않도록 절대 throw 하지 않는다.
export interface InquiryNotice {
  name: string
  email: string
  type: string
  message: string
}

export async function notifyNewInquiry(n: InquiryNotice): Promise<void> {
  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_NOTIFY_EMAIL
  if (!key || !to) return // 미설정 → 알림 없이 저장만

  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>"
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: n.email,
        subject: `[포트폴리오 문의] ${n.type} — ${n.name}`,
        text: `이름: ${n.name}\n이메일: ${n.email}\n유형: ${n.type}\n\n${n.message}`,
      }),
    })
    if (!res.ok) {
      console.error("[notify] Resend 실패:", res.status, (await res.text().catch(() => "")).slice(0, 200))
    }
  } catch (e) {
    console.error("[notify] 오류:", (e as Error).message)
  }
}
