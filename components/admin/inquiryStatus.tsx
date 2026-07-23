"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateInquiryStatus } from "../../app/admin/actions"
import { useToast } from "./toast"

// lib/inquiries.ts 의 INQUIRY_STATUSES 와 동기화(서버 전용 모듈을 클라이언트에 번들하지 않기 위해 상수만 복제).
const STATUSES = ["신규", "처리중", "완료"] as const

export default function InquiryStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const { show, node } = useToast()
  const [busy, setBusy] = useState(false)
  const current = STATUSES.includes(status as (typeof STATUSES)[number]) ? status : STATUSES[0]

  async function change(next: string) {
    if (busy || next === current) return
    setBusy(true)
    try {
      await updateInquiryStatus(id, next)
      show("success", `상태를 “${next}”(으)로 변경했습니다.`)
      router.refresh()
    } catch (e) {
      show("error", (e as Error).message || "상태 변경에 실패했습니다.")
    }
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="문의 처리 상태">
      {STATUSES.map((s) => {
        const active = s === current
        return (
          <button
            key={s}
            type="button"
            disabled={busy}
            aria-pressed={active}
            onClick={() => change(s)}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {s}
          </button>
        )
      })}
      {node}
    </div>
  )
}
