"use client"

import { useCallback, useRef, useState } from "react"

export type ToastType = "success" | "error"

// 프로바이더 없이 쓰는 경량 토스트. { show, node } 를 반환하고
// 컴포넌트는 반환된 node 를 렌더한다. 4초 뒤 자동 사라짐.
export function useToast() {
  const [toast, setToast] = useState<{ type: ToastType; msg: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((type: ToastType, msg: string) => {
    if (timer.current) clearTimeout(timer.current)
    setToast({ type, msg })
    timer.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const node = toast ? (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-md px-4 py-2.5 text-sm shadow-lg ${
        toast.type === "success" ? "bg-accent text-white" : "bg-red-600 text-white"
      }`}
    >
      {toast.msg}
    </div>
  ) : null

  return { show, node }
}
