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

    "세이지 배경" 이라고 적혀 있었다 — v2(SAGE) 시절의 서술이고 지금은 거짓이다 (#199).
    실제로는 bg-page(--bg)를 깐다. 지면과 같은 색이지만 불투명이라 뒤에 깔린 계측 배경
    캔버스를 이 자리에서만 가리고, 그래서 판에서 파낸 자국처럼 읽힌다.
    (#230 에서 "채움이 아무 일도 하지 않는다"고 판단해 바꾸려 했으나, 프리뷰를 눈으로
     보고 전제가 틀렸음을 확인해 그 이슈는 닫았다. 여기 남은 것은 주석 정정뿐이다)
  */
  if (kind === "code")
    return (
      <code
        key={key}
        className="rounded-[3px] bg-page px-[5px] py-px font-[family-name:var(--font-jbmono)] text-[0.88em] text-ink"
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
