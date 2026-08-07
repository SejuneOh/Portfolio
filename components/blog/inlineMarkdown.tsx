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
  /*
    인라인 코드. 라임은 코드 영역에 쓰지 않는다.

    채움이 bg-page 였다 (#230). 밝은 지면 시절에는 흰 표면 위의 지면색이 상자로 읽혔지만
    지면이 어두워지면서 채움과 주변이 같은 색(1:1)이 됐고, 테두리도 없어 상자가 통째로
    보이지 않았다. rounded-[3px] 과 px-[5px] 도 함께 죽어 있었다 — 보이지 않는 상자에
    준 모서리와 여백이다.

    --surface 는 지면 대비 1.05:1 이라 채움만으로는 여전히 약하다. 테두리를 함께 둬야
    상자가 성립한다. 태그 칩(@utility chip)이 쓰는 것과 같은 조합이라 어법도 맞는다.
  */
  if (kind === "code")
    return (
      <code
        key={key}
        className="rounded-[3px] border border-line bg-surface px-[5px] py-px font-[family-name:var(--font-jbmono)] text-[0.88em] text-ink"
      >
        {m[1]}
      </code>
    )
  if (kind === "bold")
    return (
      <strong key={key} className="font-semibold text-ink">
        {m[1]}
      </strong>
    )
  // 링크는 색이 아니라 라임 밑줄로 구분한다(디자인 시스템의 link-underline 규칙).
  const external = /^https?:\/\//.test(m[2])
  return (
    <a
      key={key}
      href={m[2]}
      className="link-underline"
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
