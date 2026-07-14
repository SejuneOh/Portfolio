import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { readingMinutes } from "../../../../lib/posts"
import { getPosts, getPost, getAdjacent } from "../../../../lib/postsData"
import Toc from "../../../../components/blog/toc"
import PostBody from "../../../../components/postBody"
import JsonLd from "../../../../components/jsonLd"
import { SITE_URL, AUTHOR } from "../../../../lib/site"

interface TocItem {
  id: string
  text: string
}

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.summary,
      publishedTime: post.date || undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  }
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const { prev, next } = await getAdjacent(slug)
  const toc = post.body
    .map((b, i) => (b.h ? { id: `h-${i}`, text: b.h } : null))
    .filter(Boolean) as TocItem[]
  const minutes = readingMinutes(post)
  const url = `${SITE_URL}/blog/${post.slug}`

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.date || undefined,
          url,
          mainEntityOfPage: url,
          keywords: post.tags.join(", "),
          author: { "@type": "Person", name: AUTHOR.name, url: SITE_URL },
        }}
      />
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
            <PostBody blocks={post.body} />
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
