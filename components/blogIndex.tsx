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

  /*
    채널 스트립 값. 전부 실제 집계다.
    categories 는 첫 항목이 ALL 이므로 주제 수는 하나를 뺀다.
  */
  const topicCount = Math.max(0, categories.length - 1)
  const tagCount = new Set(posts.flatMap((p) => p.tags)).size

  return (
    <>
      <header className="pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="text-[52px] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
            WRITING
          </h1>
          <p className="max-w-[46ch] text-[15px] leading-[1.8] text-muted">
            실무에서 부딪힌 문제와 해결 과정을 성능·안정성·아키텍처 중심으로 정리합니다.
          </p>
        </div>

        {/*
          채널 스트립 — 목록 화면의 계기판 상단 표시부. 홈과 Work 목록이 이미 쓴다.
          값이 0 인 채널도 낸다. 0 이라는 사실 자체가 정보다.

          markup 은 Work 목록(app/(site)/work/page.tsx)을 따른다 — 표시등에 shrink-0,
          라벨에 min-w-0, 좁은 폭에서는 세로로 쌓는다. 홈 버전에는 그 처리가 없어
          320px 에서 표시등이 폭 0 으로 눌리는 결함이 남아 있다(#207).

          표시등은 **값이 있으면 켠다.** Work 는 Live 채널에만 lit 을 주는데,
          그쪽 Live 는 "진행 중인 케이스가 있다"는 뜻이라 같은 규칙의 특수한 경우다.
        */}
        <div className="mt-7 grid grid-cols-1 border border-line bg-surface font-[family-name:var(--font-jbmono)] sm:grid-cols-3">
          {[
            { label: "Posts", value: posts.length },
            { label: "Topics", value: topicCount },
            { label: "Tags", value: tagCount },
          ].map((ch, i) => (
            <div
              key={ch.label}
              className={`flex items-center gap-2 px-4 py-2.5 ${
                i < 2 ? "border-b border-line sm:border-b-0 sm:border-r" : ""
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                  ch.value > 0 ? "bg-lime" : "bg-line"
                }`}
              />
              <span className="min-w-0 text-[10.5px] uppercase tracking-[0.18em] text-muted">
                {ch.label}
              </span>
              <span className="ml-auto shrink-0 text-[13px] text-ink">{ch.value}</span>
            </div>
          ))}
        </div>
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
              /*
                분류 이름도 Notion select 의 자유 문자열이다. 이 칩 행은 가로 스크롤이 아니라
                flex-wrap 이므로 긴 값이 들어오면 행이 넘친다 (#214).
                inline-flex 이므로 chip 유틸과 같은 이유로 overflow-wrap:anywhere 를 쓴다.
              */
              className={
                on
                  ? "inline-flex max-w-full items-center gap-1.5 rounded-[3px] bg-lime px-4 py-1.5 text-[13.5px] font-semibold text-[color:var(--lime-ink)] transition-colors [overflow-wrap:anywhere] hover:bg-[#CDEA55]"
                  : "inline-flex max-w-full items-center gap-1.5 rounded-[3px] border border-line px-4 py-1.5 text-[13.5px] text-ink transition-colors [overflow-wrap:anywhere] hover:bg-surface-hover"
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
              className="group mt-6 block rounded-[3px] bg-lime p-[26px] transition-colors hover:bg-[#CDEA55]"
              style={{ color: "var(--lime-body)" }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-[3px] bg-page px-3 py-1 text-[11px] font-semibold text-ink">
                  Pinned
                </span>
                <span className="eyebrow" style={{ color: "var(--lime-ink)" }}>
                  {[pinned.date, `${readingMinutes(pinned)}분 읽기`].filter(Boolean).join(" · ")}
                </span>
              </div>

              {/* 제목·요약은 Notion 자유 문자열이라 공백 없는 긴 토큰이 들어올 수 있다 (#214) */}
              <h2
                className="mt-4 break-words text-[30px] font-bold leading-[1.22]"
                style={{ color: "var(--lime-ink)" }}
              >
                {pinned.title}
              </h2>
              {pinned.summary && (
                <p className="mt-3 break-words text-[14.5px] leading-[1.8]">{pinned.summary}</p>
              )}

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {pinned.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-[3px] bg-black/10 px-2.5 py-0.5 text-xs font-medium"
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

          {/*
            텍스트 리스트 — 날짜 축.
            날짜를 제목 오른쪽에 붙여 두면 제목 길이에 따라 좌우로 흔들려서 훑을 수 없다.
            고정폭 칸으로 왼쪽에 세우면 날짜가 세로로 정렬돼 시간 축이 된다.
            홈 로그 축의 112px 날짜 컬럼과 같은 폭을 쓴다.

            모바일은 grid-cols-1 로 단순히 쌓는다. md: 에만 컬럼을 주면 자동배치가
            어긋나는 함정(#181)이 있는데, 단일 컬럼에서는 그 여지가 없다.

            상태 점은 두지 않는다. 목록의 모든 글이 같은 상태여서 점이 늘 같은 모양이면
            정보를 주지 않는 장식이 된다 — 홈 로그 축의 점은 진행 중인 케이스를 가릴 때만
            뜻이 있다.
          */}
          {list.length > 0 && (
            <div className="mt-2">
              {list.map((post) => (
                <Link
                  key={post.slug}
                  href={`/writing/${post.slug}`}
                  className="group grid grid-cols-1 gap-x-6 gap-y-1.5 border-b border-line py-5 transition-colors hover:bg-surface-hover md:grid-cols-[112px_minmax(0,1fr)]"
                >
                  {post.date ? (
                    <time
                      dateTime={post.date}
                      className="font-[family-name:var(--font-jbmono)] text-[11.5px] leading-[1.5] text-muted md:mt-[5px]"
                    >
                      {post.date}
                    </time>
                  ) : (
                    <span aria-hidden />
                  )}

                  <div className="min-w-0">
                    <h2 className="break-words text-[18px] font-bold leading-[1.4] text-ink underline-offset-4 group-hover:underline group-hover:decoration-lime group-hover:decoration-2">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="mt-1.5 break-words text-[14px] leading-[1.8] text-muted">
                        {post.summary}
                      </p>
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
