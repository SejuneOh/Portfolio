import { useState, useEffect } from "react"
import Link from "next/link"
import Layout from "../../components/layout"
import { posts, getPost, getAdjacent, readingMinutes } from "../../lib/posts"

/* 코드 블록 + 복사 버튼 */
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {}
  }
  return (
    <div className="group relative mt-5">
      <button
        onClick={copy}
        className="absolute right-2 top-2 rounded-md border border-line bg-page/80 px-2 py-1 font-mono text-[11px] text-muted opacity-0 backdrop-blur transition-opacity hover:text-fg group-hover:opacity-100"
      >
        {copied ? "복사됨 ✓" : "복사"}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed text-fg">
        {code}
      </pre>
    </div>
  )
}

function Block({ block, index }) {
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

/* 오른쪽 sticky 목차 + 스크롤 스파이 */
function Toc({ items }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const els = items
      .map((it) => document.getElementById(it.id))
      .filter(Boolean)
    if (!els.length) return
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    )
    els.forEach((el) => ob.observe(el))
    return () => ob.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-14 border-l border-line pl-4 text-sm">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted">목차</p>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={`block leading-snug transition-colors ${
                  active === it.id ? "text-accent" : "text-muted hover:text-fg"
                }`}
              >
                {it.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default function Post({ post, prev, next, toc, minutes }) {
  return (
    <Layout title={`${post.title} — Sejune Oh`}>
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
    </Layout>
  )
}

export function getStaticPaths() {
  return { paths: posts.map((p) => ({ params: { slug: p.slug } })), fallback: false }
}

export function getStaticProps({ params }) {
  const post = getPost(params.slug)
  if (!post) return { notFound: true }
  const { prev, next } = getAdjacent(params.slug)
  const toc = post.body
    .map((b, i) => (b.h ? { id: `h-${i}`, text: b.h } : null))
    .filter(Boolean)
  return {
    props: {
      post,
      toc,
      minutes: readingMinutes(post),
      prev: prev ? { slug: prev.slug, title: prev.title } : null,
      next: next ? { slug: next.slug, title: next.title } : null,
    },
  }
}
