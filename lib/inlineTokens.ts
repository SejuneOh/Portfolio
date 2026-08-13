/*
  인라인 표기(`code` · **bold** · [text](url))를 토큰 목록으로 쪼갠다. JSX 를 만들지 않는다 —
  무엇으로 그릴지는 부르는 쪽이 정한다 (#262).

  전에는 이 스캔 루프가 components/blog/inlineMarkdown.tsx 안에 있었고 Tailwind 클래스와
  붙어 있었다. 이력서는 같은 문법을 쓰지만 styled-jsx 로 그리고(`.kbd` · <b>) 클래스가
  다르므로, **스캔은 공유하고 매핑은 각자** 하도록 갈랐다.

  순수 함수라 렌더 밖에서도 쓸 수 있다 — 이력서 저장 전에 "항목당 강조 하나"(#256 규칙)를
  세는 검사가 이 토큰을 쓸 예정이다 (#262 4단계).
*/

export type InlineKind = "text" | "code" | "bold" | "link"

export interface InlineToken {
  kind: InlineKind
  /** text: 있는 그대로 / code·bold: 표기 안쪽 / link: 링크 글자 */
  text: string
  /** link 만 */
  href?: string
}

const RULES: { kind: Exclude<InlineKind, "text">; re: RegExp }[] = [
  { kind: "code", re: /`([^`]+)`/ },
  { kind: "bold", re: /\*\*([^*]+?)\*\*/ },
  { kind: "link", re: /\[([^\]]+)\]\(([^)\s]+)\)/ },
]

export function tokenizeInline(src: string): InlineToken[] {
  const out: InlineToken[] = []
  let rest = src

  while (rest.length) {
    // 남은 문자열에서 가장 앞선 매치를 찾는다. 같은 자리면 code > bold > link 순서다.
    let best: { kind: Exclude<InlineKind, "text">; index: number; m: RegExpMatchArray } | null = null
    for (const rule of RULES) {
      const m = rest.match(rule.re)
      if (m && m.index !== undefined && (best === null || m.index < best.index)) {
        best = { kind: rule.kind, index: m.index, m }
      }
    }

    if (!best) {
      out.push({ kind: "text", text: rest })
      break
    }
    if (best.index > 0) out.push({ kind: "text", text: rest.slice(0, best.index) })
    out.push(
      best.kind === "link"
        ? { kind: "link", text: best.m[1], href: best.m[2] }
        : { kind: best.kind, text: best.m[1] }
    )
    rest = rest.slice(best.index + best.m[0].length)
  }

  return out
}

/** 표기를 벗긴 순수 텍스트. 글자 수를 세거나 비교할 때 쓴다. */
export function stripInline(src: string): string {
  return tokenizeInline(src)
    .map((t) => t.text)
    .join("")
}

/** 강조(**...**) 개수. #256 의 "항목당 하나" 규칙을 검사할 때 쓴다. */
export function countBold(src: string): number {
  return tokenizeInline(src).filter((t) => t.kind === "bold").length
}
