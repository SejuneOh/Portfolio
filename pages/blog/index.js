import { useState } from "react"
import Link from "next/link"
import Layout from "../../components/layout"
import { posts, categories } from "../../lib/posts"

// 메이슨리에서 높이 변화를 주기 위한 커버 비율 (매거진 콜라주 느낌)
const ratios = ["aspect-[4/5]", "aspect-[5/4]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]"]

export default function Blog() {
  const [active, setActive] = useState("All")
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active)

  return (
    <Layout title="Blog — Sejune Oh">
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">OK. Blog</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
          기록으로 남기는 백엔드
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          실무에서 부딪힌 문제와 해결 과정을 성능·안정성·아키텍처 중심으로 정리합니다.
        </p>
      </header>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-line pb-4">
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

      {/* Masonry gallery */}
      <div className="gap-8 sm:columns-2 xl:columns-3">
        {filtered.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group mb-8 block break-inside-avoid"
          >
            <div
              className={`flex items-end overflow-hidden bg-gradient-to-br ${post.gradient} ${ratios[i % ratios.length]} p-4`}
            >
              <span className="rounded-md bg-black/25 px-2 py-0.5 font-mono text-xs text-white backdrop-blur-sm">
                {post.category}
              </span>
            </div>
            <div className="pt-3">
              <h2 className="text-base font-bold leading-snug text-fg transition-colors group-hover:text-accent">
                {post.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{post.summary}</p>
              <div className="mt-3 flex items-center gap-3">
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
    </Layout>
  )
}
