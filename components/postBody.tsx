import type { Block } from "../lib/posts"
import CodeBlock from "./blog/codeBlock"
import { renderInline } from "./blog/inlineMarkdown"

// 본문 블록 렌더러 — 블로그 글·프로젝트 상세가 공유.
// 헤딩 id(h-{index})는 TOC 스크롤스파이 호환용.
function BlockView({ block, index }: { block: Block; index: number }) {
  if (block.h)
    return (
      <h2 id={`h-${index}`} className="mt-10 mb-3 scroll-mt-24 text-2xl font-bold text-fg">
        {renderInline(block.h)}
      </h2>
    )
  if (block.p)
    return <p className="mt-4 text-[16px] leading-[1.8] text-muted">{renderInline(block.p)}</p>
  if (block.code) return <CodeBlock code={block.code} lang={block.lang} />
  if (block.ul)
    return (
      <ul className="mt-4 space-y-2">
        {block.ul.map((li, i) => (
          <li
            key={i}
            className="relative pl-5 text-[16px] leading-relaxed text-muted before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-xs before:bg-accent"
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
