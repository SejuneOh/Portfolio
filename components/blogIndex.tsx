"use client"

import { useState } from "react"
import Link from "next/link"
import { readingMinutes, type Post } from "../lib/posts"

const ALL = "All"

/*
  글 목록. 전폭 단일 컬럼이다 — 사이드 레일을 두지 않는다.

  목록은 스캔하는 화면이라 본문을 읽는 동안 곁눈으로 볼 정보가 없다. 그래서
  Topics 는 제목 아래 필터 칩 행으로 올리고, RSS 는 다 훑은 뒤에 나오도록 목록
  하단에 둔다. 목록 화면의 필터를 위로 모으는 것은 화면 골격 결정(#154)이며,
  Work 목록도 같은 문법을 쓰게 된다(그쪽은 아직 구 디자인이다).

  Pinned 여부를 나타내는 데이터가 없으므로 **가장 최근 글**을 그 자리에 놓고,
  아래 리스트에서 제외해 중복을 피한다. 필터가 걸리면 Pinned 카드를 감추고
  목록만 보여준다 — RSS 카드는 어느 상태에서든 남는다.
*/
export default function BlogIndex({
  posts,
  categories,
}: {
  posts: Post[]
  categories: string[]
}) {
  const [active, setActive] = useState(ALL)

  const filtered = active === ALL ? posts : posts.filter((p) => p.category === active)

  // Pinned 카드는 `전체`에서만 노출한다. 그때만 리스트에서 그 글을 뺀다.
  const pinned = active === ALL ? filtered[0] : undefined
  const list = pinned ? filtered.slice(1) : filtered

  // 칩 카운트는 실제 집계다. 디자인의 숫자는 예시였다.
  const countOf = (c: string) =>
    c === ALL ? posts.length : posts.filter((p) => p.category === c).length

  return (
    <>
      <header className="flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between">
        <h1 className="text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
          WRITING
        </h1>
        <p className="max-w-[46ch] text-[15px] leading-[1.8] text-muted">
          실무에서 부딪힌 문제와 해결 과정을 성능·안정성·아키텍처 중심으로 정리합니다.
        </p>
      </header>

      {/*
        Topics — 필터 칩 행. 활성 칩만 라임.
        카테고리가 `All` 하나뿐이면(글이 없거나 전부 분류 미지정) 고를 것이 없어
        `All 0` 칩과 보더만 남으므로 행 자체를 렌더하지 않는다.
      */}
      {categories.length > 1 && (
      <div className="flex flex-wrap gap-2 border-b border-line pb-4">
        {categories.map((c) => {
          const on = active === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={on}
              className={
                on
                  ? "inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-1.5 text-[13.5px] font-semibold text-[color:var(--lime-ink)] transition-colors hover:bg-[#CDEA55]"
                  : "inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-[13.5px] text-ink transition-colors hover:bg-surface-hover"
              }
            >
              {c}
              <span className="opacity-60">{countOf(c)}</span>
            </button>
          )
        })}
      </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">아직 작성된 글이 없습니다.</p>
      ) : (
        <>
          {/* Pinned 라임 카드 */}
          {pinned && (
            <Link
              href={`/writing/${pinned.slug}`}
              className="group mt-6 block rounded-[26px] bg-lime p-[26px] transition-colors hover:bg-[#CDEA55]"
              style={{ color: "var(--lime-body)" }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-page px-3 py-1 text-[11px] font-semibold text-ink">
                  Pinned
                </span>
                <span className="eyebrow" style={{ color: "var(--lime-ink)" }}>
                  {[pinned.date, `${readingMinutes(pinned)}분 읽기`].filter(Boolean).join(" · ")}
                </span>
              </div>

              <h2
                className="mt-4 text-[30px] font-bold leading-[1.22]"
                style={{ color: "var(--lime-ink)" }}
              >
                {pinned.title}
              </h2>
              {pinned.summary && (
                <p className="mt-3 text-[14.5px] leading-[1.8]">{pinned.summary}</p>
              )}

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {pinned.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-medium"
                      style={{ color: "var(--lime-ink)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span
                  aria-hidden
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-page text-ink transition-colors group-hover:bg-surface-hover"
                >
                  ⟶
                </span>
              </div>
            </Link>
          )}

          {/* 텍스트 리스트 */}
          {list.length > 0 && (
            <div className="mt-2">
              {list.map((post) => (
                <Link
                  key={post.slug}
                  href={`/writing/${post.slug}`}
                  className="group block border-b border-line py-5 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-[18px] font-bold leading-[1.4] text-ink underline-offset-4 group-hover:underline group-hover:decoration-lime group-hover:decoration-2">
                      {post.title}
                    </h2>
                    {post.date && (
                      <time className="eyebrow shrink-0 text-muted">{post.date}</time>
                    )}
                  </div>
                  {post.summary && (
                    <p className="mt-1.5 text-[14px] leading-[1.8] text-muted">{post.summary}</p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="eyebrow text-muted">{readingMinutes(post)}분 읽기</span>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </>
      )}

      {/*
        RSS 판 — 목록 하단. 다 훑은 뒤 구독을 권한다.
        빈 상태 분기 밖에 둔다. getPosts() 는 Notion 미설정·실패 시 빈 배열을
        반환하므로 글 0편은 운영 중 도달하는 경로이고, 그때 구독 경로까지
        사라지면 화면에 남는 것이 안내 문구 하나뿐이다.
      */}
      <div className="card-ink mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-muted">Subscribe</p>
          <p className="mt-2 text-[14.5px] font-semibold text-ink">새 글을 리더로 받아보세요</p>
        </div>
        <a href="/feed.xml" className="btn-lime shrink-0">
          /feed.xml →
        </a>
      </div>
    </>
  )
}
