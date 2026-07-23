import React from "react"

// 본문 텍스트의 인라인 마크다운을 React 노드로 변환한다.
// 지원: 인라인 코드 `code`, 볼드 **bold**, 링크 [text](url).
// (블록 레벨 — 헤딩/코드펜스/목록 — 은 상위 Block 렌더러가 처리)

type Kind = "code" | "bold" | "link"
const RULES: { kind: Kind; re: RegExp }[] = [
  { kind: "code", re: /`([^`]+)`/ },
  { kind: "bold", re: /\*\*([^*]+?)\*\*/ },
  { kind: "link", re: /\[([^\]]+)\]\(([^)\s]+)\)/ },
]

function renderMatch(kind: Kind, m: RegExpMatchArray, key: number): React.ReactNode {
  if (kind === "code")
    return (
      <code
        key={key}
        className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-[0.88em] text-accent"
      >
        {m[1]}
      </code>
    )
  if (kind === "bold")
    return (
      <strong key={key} className="font-semibold text-fg">
        {m[1]}
      </strong>
    )
  // link
  const external = /^https?:\/\//.test(m[2])
  return (
    <a
      key={key}
      href={m[2]}
      className="text-accent underline underline-offset-2 hover:opacity-80"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {m[1]}
    </a>
  )
}

export function renderInline(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  let rest = text
  let key = 0

  while (rest.length) {
    // 남은 문자열에서 가장 앞선 매치를 찾는다(코드 > 볼드 > 링크는 동일 위치일 때 우선순위).
    let best: { kind: Kind; index: number; m: RegExpMatchArray } | null = null
    for (const rule of RULES) {
      const m = rest.match(rule.re)
      if (m && m.index !== undefined && (best === null || m.index < best.index)) {
        best = { kind: rule.kind, index: m.index, m }
      }
    }

    if (!best) {
      nodes.push(rest)
      break
    }
    if (best.index > 0) nodes.push(rest.slice(0, best.index))
    nodes.push(renderMatch(best.kind, best.m, key++))
    rest = rest.slice(best.index + best.m[0].length)
  }

  return nodes
}
