"use server"

import { createInquiry, INQUIRY_TYPES } from "../../../lib/inquiries"

export interface ContactState {
  ok: boolean
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitInquiry(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // 허니팟: 봇이 채우는 숨은 필드. 값이 있으면 조용히 성공 처리(스팸 차단).
  if (String(formData.get("company") || "").trim()) {
    return { ok: true, message: "문의가 접수되었습니다. 감사합니다." }
  }

  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const type = String(formData.get("type") || "").trim()
  const message = String(formData.get("message") || "").trim()

  if (!name) return { ok: false, message: "이름을 입력해주세요." }
  if (!EMAIL_RE.test(email)) return { ok: false, message: "올바른 이메일 형식이 아닙니다." }
  if (!message) return { ok: false, message: "메시지를 입력해주세요." }
  const safeType = (INQUIRY_TYPES as readonly string[]).includes(type) ? type : INQUIRY_TYPES[0]

  try {
    await createInquiry({ name, email, type: safeType, message })
    return { ok: true, message: "문의가 접수되었습니다. 확인 후 회신드리겠습니다." }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}
