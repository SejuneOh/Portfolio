"use client"

import { useState } from "react"

/* 코드 블록 + 복사 버튼 */
export default function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <div className="group relative mt-5">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-line bg-page/80 px-2 py-1 font-mono text-[11px] text-muted opacity-0 backdrop-blur transition-opacity hover:text-fg group-hover:opacity-100"
      >
        {copied ? "복사됨 ✓" : "복사"}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed text-fg">
        {code}
      </pre>
    </div>
  )
}
