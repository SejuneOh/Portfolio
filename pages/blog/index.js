import { useState } from "react"
import Link from "next/link"
import Layout from "../../components/layout"
import { posts, categories } from "../../lib/posts"

export default function Blog() {
  const [active, setActive] = useState("All")

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active)

  return (
    <Layout title="Blog — Sejune Oh">
      <div className="mx-auto max-w-content px-5 py-16">
        {/* Hero */}
        <section className="animate-rise">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">Blog</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            기록으로 남기는 백엔드
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            실무에서 부딪힌 문제와 해결 과정을 정리합니다. 성능·안정성·아키텍처를 중심으로,
            무엇을 왜 그렇게 결정했는지 기록합니다.
          </p>
        </section>

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-line pb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === c
                  ? "bg-accent text-white"
                  : "border border-line text-muted hover:bg-surface hover:text-fg"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card group flex flex-col overflow-hidden hover:bg-surface-hover hover:shadow-sm"
            >
              <div
                className={`flex aspect-[16/10] items-end bg-gradient-to-br ${post.gradient} p-4`}
              >
                <span className="rounded-md bg-black/20 px-2 py-0.5 font-mono text-xs text-white backdrop-blur-sm">
                  {post.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-base font-semibold leading-snug text-fg group-hover:text-accent">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                  {post.summary}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <time className="font-mono text-xs text-muted">{post.date}</time>
                  <div className="flex gap-1.5">
                    {post.tags.slice(0, 2).map((t) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
