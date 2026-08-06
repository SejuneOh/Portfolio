import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { readingMinutes, type Post } from "../../../../lib/posts"
import { getPosts, getPost } from "../../../../lib/postsData"
import Toc from "../../../../components/blog/toc"
import PostBody from "../../../../components/postBody"
import JsonLd from "../../../../components/jsonLd"
import { SITE_URL, AUTHOR } from "../../../../lib/site"

interface TocItem {
  id: string
  text: string
}

// 이어서 읽기에 낼 개수. 2열 타일이라 둘까지.
const RELATED_CAP = 2

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
  const url = `${SITE_URL}/writing/${post.slug}`
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

/*
  이어서 읽기 — 같은 태그를 공유하는 글을 겹치는 태그가 많은 순으로 고른다.
  추천 근거를 타일 상단에 그대로 낸다(`같은 태그 · 실시간`). 근거를 못 대면
  추천이 아니라 나열이므로, 겹치는 태그가 없으면 그 글은 넣지 않는다.
*/
function relatedTo(post: Post, all: Post[]) {
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ post: p, shared: p.tags.filter((t) => post.tags.includes(t)) }))
    .filter((r) => r.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, RELATED_CAP)
}

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const all = await getPosts()
  const related = relatedTo(post, all)

  const toc = post.body
    .map((b, i) => (b.h ? { id: `h-${i}`, text: b.h } : null))
    .filter(Boolean) as TocItem[]
  const minutes = readingMinutes(post)
  const url = `${SITE_URL}/writing/${post.slug}`
  const meta = [post.date, `${minutes}분 읽기`].filter(Boolean)

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

      {/*
        Toc 는 한 번만 마운트한다 — 컴포넌트가 안에서 모바일(접힘)·데스크톱(sticky)을
        모두 처리하므로 두 자리에 놓으면 같은 헤딩에 IntersectionObserver 가 두 번 붙는다.

        배치는 order 가 아니라 명시적 행/열로 한다. 머리말·목차·본문을 같은 레벨의
        그리드 아이템으로 두면 DOM 순서가 곧 모바일 순서(머리말 → 목차 → 본문)가 되고,
        데스크톱에서는 목차만 우측 열로 보내면 된다. 시각 순서와 DOM·포커스 순서가
        어긋나지 않는다.
      */}
      <article className="grid gap-x-11 gap-y-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        <header className="min-w-0 max-w-[700px] lg:col-start-1 lg:row-start-1">
          <Link
            href="/writing"
            className="font-[family-name:var(--font-jbmono)] text-xs text-ink transition-colors hover:text-muted"
          >
            ← Writing
          </Link>

          {/* 메타 행 — 카테고리만 라임 필 */}
          <div className="mt-6 flex flex-wrap items-center gap-2 font-[family-name:var(--font-jbmono)] text-[11.5px] text-muted">
            {meta[0] && <span>{meta[0]}</span>}
            {post.category && (
              <span
                className="rounded-[3px] bg-lime px-2.5 py-0.5 font-semibold"
                style={{ color: "var(--lime-ink)" }}
              >
                {post.category}
              </span>
            )}
            {meta[1] && <span>{meta[1]}</span>}
          </div>

          <h1 className="mt-3 text-[40px] font-bold leading-[1.12] tracking-[-0.032em] text-ink">
            {post.title}
          </h1>

          {/*
            TL;DR — 글 자체의 요약(summary)을 쓴다. Notion 에서 따로 적는 필드라
            본문 첫 문단을 자른 것이 아니다. 비어 있으면 박스를 내지 않는다.
          */}
          {post.summary && (
            <div className="mt-6 flex flex-col gap-2 rounded-[3px] bg-page px-5 py-[18px] sm:flex-row sm:gap-5">
              <span className="eyebrow shrink-0 text-muted sm:pt-1">TL;DR</span>
              <p className="text-[14px] leading-[1.8] text-[color:var(--text-body)]">
                {post.summary}
              </p>
            </div>
          )}

        </header>

        {/* 목차 — 모바일에서는 여기(머리말 뒤·본문 앞), 데스크톱에서는 우측 열 */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <Toc items={toc} />
          {/*
            "관련 케이스" 링크는 만들지 않았다. 글과 케이스를 잇는 데이터가 없다.
            태그가 겹치는 케이스를 끌어오는 규칙은 연결이 아니라 추측이다.
          */}
        </div>

        <div className="min-w-0 max-w-[700px] lg:col-start-1 lg:row-start-2">
          <PostBody blocks={post.body} />

          {/*
            계측 타일 3개는 만들지 않았다. 글 단위 수치 데이터가 없고, 본문에서
            숫자를 뽑아 채우는 것은 이슈가 금지한 "추측해 채우기"에 해당한다.
            데이터가 생기면 이 자리에 3열 타일(가운데만 라임)이 들어간다.
          */}

          {/* 이어서 읽기 — 2열 세이지 타일 */}
          {related.length > 0 && (
            <section className="mt-16 border-t border-line pt-8">
              <p className="eyebrow text-muted">이어서 읽기</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.map(({ post: r, shared }) => (
                  <Link
                    key={r.slug}
                    href={`/writing/${r.slug}`}
                    className="group rounded-[3px] bg-page p-5 transition-colors hover:bg-surface-hover"
                  >
                    <p className="eyebrow text-muted">같은 태그 · {shared.slice(0, 2).join(" · ")}</p>
                    <p className="mt-2 text-[15px] font-semibold leading-snug text-ink underline-offset-4 group-hover:underline group-hover:decoration-lime group-hover:decoration-2">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
