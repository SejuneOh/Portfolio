import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { Block as BlockType } from "../../../../lib/posts"
import { posts, getPost, getAdjacent, readingMinutes } from "../../../../lib/posts"
import CodeBlock from "../../../../components/blog/codeBlock"
import Toc from "../../../../components/blog/toc"

interface TocItem {
  id: string
  text: string
}

function Block({ block, index }: { block: BlockType; index: number }) {
  if (block.h)
    return (
      <h2 id={`h-${index}`} className="mt-10 mb-3 scroll-mt-24 text-2xl font-bold text-fg">
        {block.h}
      </h2>
    )
  if (block.p) return <p className="mt-4 text-[16px] leading-[1.8] text-muted">{block.p}</p>
  if (block.code) return <CodeBlock code={block.code} />
  if (block.ul)
    return (
      <ul className="mt-4 space-y-2">
        {block.ul.map((li, i) => (
          <li
            key={i}
            className="relative pl-5 text-[16px] leading-relaxed text-muted before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-sm before:bg-accent"
          >
            {li}
          </li>
        ))}
      </ul>
    )
  return null
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return { title: post.title }
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const { prev, next } = getAdjacent(slug)
  const toc = post.body
    .map((b, i) => (b.h ? { id: `h-${i}`, text: b.h } : null))
    .filter(Boolean) as TocItem[]
  const minutes = readingMinutes(post)

  return (
    <>
      <Link href="/blog" className="font-mono text-xs text-muted hover:text-accent">
        ← Blog
      </Link>

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_180px] lg:gap-12">
        <article className="min-w-0 max-w-[680px]">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-accent">
            <span>{post.date}</span>
            <span className="text-muted">·</span>
            <span>{post.category}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{minutes}분 읽기</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>

          <div className="mt-8 border-t border-line pt-2">
            {post.body.map((block, i) => (
              <Block key={i} block={block} index={i} />
            ))}
          </div>

          {/* prev / next */}
          <nav className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="group rounded-lg border border-line p-4 hover:bg-surface">
                <span className="font-mono text-xs text-muted">← 이전 글</span>
                <p className="mt-1 text-sm font-semibold text-fg group-hover:text-accent">{prev.title}</p>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="group rounded-lg border border-line p-4 text-right hover:bg-surface">
                <span className="font-mono text-xs text-muted">다음 글 →</span>
                <p className="mt-1 text-sm font-semibold text-fg group-hover:text-accent">{next.title}</p>
              </Link>
            ) : <span />}
          </nav>
        </article>

        <Toc items={toc} />
      </div>
    </>
  )
}
