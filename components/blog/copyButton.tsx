"use client"

import { useState } from "react"

/*
  코드블록 복사 버튼. 하이라이트는 서버(CodeBlock)에서 처리하고 복사만 클라이언트로 분리.

  복사 로직과 1.5초 라벨 토글은 그대로다. 배치만 바뀌었다 — 예전에는 블록 위에
  절대 위치로 떠 있고 hover 해야 보였는데, 새 규격에서 코드블록에 헤더가 생겨
  그 안에 항상 보이는 아웃라인 버튼으로 들어간다.
*/
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
      /*
        머리 바(--surface-hover) 위에 --surface 배경이라 배경만으로는 1.07:1 밖에 구분되지
        않는다. 테두리가 유일한 단서인데 border-line 은 1.23:1 로 WCAG 1.4.11(3:1)에
        못 미친다 — border-control 을 쓴다 (#229).
      */
      className="shrink-0 rounded-[3px] border border-control bg-surface px-3 py-1 font-[family-name:var(--font-jbmono)] text-[11px] text-ink transition-colors hover:bg-page"
    >
      {copied ? "복사됨 ✓" : "복사"}
    </button>
  )
}
