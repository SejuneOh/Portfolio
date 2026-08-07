import type { Block } from "../lib/posts"
import CodeBlock from "./blog/codeBlock"
import { renderInline } from "./blog/inlineMarkdown"

/*
  본문 블록 렌더러 — 글 상세와 케이스 상세가 공유한다.
  한쪽 톤을 바꾸면 다른 쪽 본문도 함께 바뀐다.

  헤딩 id(h-{index})는 TOC 스크롤스파이 호환용이다. 요소는 h2 를 유지한다 —
  페이지 H1 아래에서 h3 로 내리면 헤딩 순서가 끊긴다. 크기만 26px 로 맞춘다.

  **모든 블록에 break-words 를 준다.** Notion 본문은 자유 문자열이라
  `컨텍스트(Chat/WhatsApp/WeChat/LINE/Internal/…)` 처럼 공백 없는 긴 토큰이 들어온다.
  CSS 기본값(overflow-wrap: normal)은 공백에서만 줄을 바꾸므로 상자를 넘겨서라도 한 줄로
  그리고, 그 결과 문서가 가로로 넘친다(320px 에서 +75px 확인, #214).

  word-break: break-all 은 쓰지 않는다 — 한글 문단을 아무 곳이나 끊어 가독성이 떨어진다.
  break-words(overflow-wrap: break-word)는 한 줄에 들어가지 않는 토큰만 끊는다.

  서체를 두 갈래로 나눈다 — **읽는 자리는 세리프(Gowun Batang), 구조는 고딕(Plex Sans KR).**
  app/layout.tsx 가 선언한 사이트 규칙이고, #176 이 --font-serif 를 받아 두었으나
  이 커밋 전까지 저장소 전체에서 참조가 0건이었다. 서체를 내려받고 쓰지 않고 있었다.

  문단·목록이 세리프고 헤딩은 고딕이다. 케이스 상세 본문도 같이 바뀐다 —
  위 주석대로 의도된 결합이며, 문제·접근·결과 문단도 읽는 자리이므로 규칙이 같다.

  크기와 행간은 그대로 둔다(15.5px / 1.85). 두 서체의 한글 줄 폭을 재보니
  15.5px 에서 비율이 1.017 이고 「한」 글리프 폭이 14px 로 같아서, 서체만 바꿔도
  줄당 글자 수가 유지된다 — 케이스 상세가 리플로우되지 않는다.
*/
function BlockView({ block, index }: { block: Block; index: number }) {
  if (block.h)
    return (
      <h2
        id={`h-${index}`}
        className="mt-10 mb-3 scroll-mt-24 break-words text-[26px] font-bold leading-[1.3] tracking-[-0.02em] text-ink"
      >
        {renderInline(block.h)}
      </h2>
    )
  if (block.p)
    return (
      <p className="mt-4 break-words font-[family-name:var(--font-serif)] text-[15.5px] leading-[1.85] text-[color:var(--text-body)]">
        {renderInline(block.p)}
      </p>
    )
  if (block.code) return <CodeBlock code={block.code} lang={block.lang} />
  if (block.ul)
    return (
      <ul className="mt-4 space-y-2">
        {block.ul.map((li, i) => (
          // 불릿은 라임 7px 사각형. 라임을 쓰는 세 자리 중 하나다.
          <li
            key={i}
            className="relative break-words pl-5 font-[family-name:var(--font-serif)] text-[15.5px] leading-[1.85] text-[color:var(--text-body)] before:absolute before:left-0 before:top-[0.72em] before:h-[7px] before:w-[7px] before:rounded-[2px] before:bg-lime"
          >
            {renderInline(li)}
          </li>
        ))}
      </ul>
    )
  return null
}

export default function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} index={i} />
      ))}
    </>
  )
}
