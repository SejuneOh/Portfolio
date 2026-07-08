"use client"

import { useState } from "react"
import Link from "next/link"
import { posts, categories, readingMinutes } from "../lib/posts"

export default function BlogIndex() {
  const [active, setActive] = useState("All")
  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active)

  return (
    <>
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
      <div className="mb-2 flex flex-wrap gap-2 border-b border-line pb-4">
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

      {/* Text-first list */}
      <div className="divide-y divide-line">
        {filtered.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block py-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-lg font-bold leading-snug text-fg transition-colors group-hover:text-accent">
                {post.title}
              </h2>
              <time className="shrink-0 font-mono text-xs text-muted">{post.date}</time>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{post.summary}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
              <span className="font-mono">{readingMinutes(post)}분 읽기</span>
              <span className="text-line">·</span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
