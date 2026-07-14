"use client"

import { useState } from "react"

// 코드블록 복사 버튼. 하이라이트는 서버(CodeBlock)에서 처리하고 복사만 클라이언트로 분리.
export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="코드 복사"
      className="absolute right-2 top-2 z-10 rounded-md border border-line bg-page/80 px-2 py-1 font-mono text-[11px] text-muted opacity-0 backdrop-blur transition-opacity hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
    >
      {copied ? "복사됨 ✓" : "복사"}
    </button>
  )
}
