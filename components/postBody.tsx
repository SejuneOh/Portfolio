import type { Block } from "../lib/posts"
import CodeBlock from "./blog/codeBlock"
import { renderInline } from "./blog/inlineMarkdown"

/*
  본문 블록 렌더러 — 글 상세와 케이스 상세가 공유한다.
  한쪽 톤을 바꾸면 다른 쪽 본문도 함께 바뀐다.

  헤딩 id(h-{index})는 TOC 스크롤스파이 호환용이다. 요소는 h2 를 유지한다 —
  페이지 H1 아래에서 h3 로 내리면 헤딩 순서가 끊긴다. 크기만 26px 로 맞춘다.
*/
function BlockView({ block, index }: { block: Block; index: number }) {
  if (block.h)
    return (
      <h2
        id={`h-${index}`}
        className="mt-10 mb-3 scroll-mt-24 text-[26px] font-bold leading-[1.3] tracking-[-0.02em] text-ink"
      >
        {renderInline(block.h)}
      </h2>
    )
  if (block.p)
    return (
      <p className="mt-4 text-[15.5px] leading-[1.85] text-[color:var(--text-body)]">
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
            className="relative pl-5 text-[15.5px] leading-[1.85] text-[color:var(--text-body)] before:absolute before:left-0 before:top-[0.72em] before:h-[7px] before:w-[7px] before:rounded-[2px] before:bg-lime"
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
