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
    실제로 까는 것은 bg-page(--bg)다.

    **이 채움은 상자를 만들지 못한다.** bg-page 는 --bg 이고 본문도 --bg 위에 있으므로
    CSS 상 명암비가 1.0:1 이다. 불투명이라 뒤에 깔린 계측 배경을 가리기는 하지만,
    그 배경은 네 겹이고 겹마다 다르다 — 격자는 --grid 1px 선이 76px 간격인 CSS 이고
    위에서 옅어지는 마스크가 걸려 있다. 파형만 캔버스로 그린다
    (components/console/instrumentBg.tsx 머리 주석과 backgroundImage·maskImage 참조).
    한 줄 높이의 조각이 무엇을 가릴지는 자리마다 다르다 — 기댈 수 없다.

    그런데도 이 조각이 본문과 구분되는 이유는 채움이 아니라 **모노 서체와 text-ink**
    (본문은 --text-body)다. 그래서 읽는 데 지장이 없고, 승격 직전에 결함 아닌 것을
    바꾸지 않기로 해 그대로 뒀다 (#230 을 그 이유로 닫았다).

    같은 문제를 큰 상자에서는 이미 고쳤다 — 거기서는 채움이 아무 일도 못 하는 것이
    그대로 손해였다. about 의 Contact 카드는 card 로, writing 상세의 TL;DR 은 라임
    좌측 눈금으로 바꿨다. (줄 번호는 적지 않는다 — 금방 낡는다)

    rounded-[3px] 과 px-[5px] 는 보이지 않는 상자에 준 모서리와 여백이다. 남겨 두지만
    무엇을 하고 있는지는 위와 같다.
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
