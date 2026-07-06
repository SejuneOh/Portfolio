import Link from "next/link"
import Layout from "../../components/layout"
import { posts, getPost } from "../../lib/posts"

function Block({ block }) {
  if (block.h) return <h2 className="mt-10 mb-3 text-2xl font-semibold text-fg">{block.h}</h2>
  if (block.p) return <p className="mt-4 text-[15px] leading-[1.8] text-muted">{block.p}</p>
  if (block.code)
    return (
      <pre className="mt-5 overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-[13px] leading-relaxed text-fg">
        {block.code}
      </pre>
    )
  if (block.ul)
    return (
      <ul className="mt-4 space-y-2">
        {block.ul.map((li, i) => (
          <li
            key={i}
            className="relative pl-5 text-[15px] leading-relaxed text-muted before:absolute before:left-0 before:top-[0.65em] before:h-1.5 before:w-1.5 before:rounded-sm before:bg-accent"
          >
            {li}
          </li>
        ))}
      </ul>
    )
  return null
}

export default function Post({ post }) {
  return (
    <Layout title={`${post.title} — Sejune Oh`}>
      <article className="mx-auto max-w-prose px-5 py-16">
        <Link href="/blog" className="font-mono text-xs text-muted hover:text-accent">
          ← Blog
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs text-accent">
          <span>{post.date}</span>
          <span className="text-muted">·</span>
          <span>{post.category}</span>
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
            <Block key={i} block={block} />
          ))}
        </div>

        <div className="mt-14 border-t border-line pt-6">
          <Link href="/blog" className="text-sm text-accent hover:text-accent-hover">
            ← 다른 글 보기
          </Link>
        </div>
      </article>
    </Layout>
  )
}

export function getStaticPaths() {
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export function getStaticProps({ params }) {
  const post = getPost(params.slug)
  if (!post) return { notFound: true }
  return { props: { post } }
}
