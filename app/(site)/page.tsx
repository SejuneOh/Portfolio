import Link from "next/link"
import { getProjectGroups } from "../../lib/notion"
import { getPosts } from "../../lib/postsData"
import { readingMinutes } from "../../lib/posts"
import JsonLd from "../../components/jsonLd"
import { SITE_URL, SITE_DESCRIPTION, AUTHOR } from "../../lib/site"

export const revalidate = 3600

// 라임 카드 1개 + 텍스트 리스트 4개.
const LIST_CAP = 4

// Topics 카드는 태그가 이보다 적으면 렌더하지 않는다 — 칩 한두 개짜리 카드는
// 정보가 아니라 빈칸으로 보인다.
const TOPICS_MIN = 3

/*
  홈은 개발 로그다. 최신 글이 주인공이고 정체성·케이스가 주변을 받친다.
  Server Component 를 유지한다 — 데이터 페칭 방식은 바꾸지 않는다.

  수치(Proof) 카드는 **이 파일에 없다.** 개선 전·후 값이 데이터에 없고 임시
  하드코딩을 넣지 않기로 정해져 있어서, 골격도 두지 않았다. 필드가 들어오는
  작업에서 카드와 조건부 렌더를 함께 추가하게 된다.
*/
export default async function Home() {
  const [groups, posts] = await Promise.all([getProjectGroups(), getPosts()])

  const [latest, ...rest] = posts
  const list = rest.slice(0, LIST_CAP)
  // 홈이 이미 전부 보여주고 있으면 "더 보기"는 막힌 링크가 된다.
  const hasMore = posts.length > 1 + list.length

  // Now 카드 — 진행 중인 프로젝트가 있으면 그것, 없으면 가장 최근 것.
  const now = groups.find((g) => g.inProgress) ?? groups[0]
  // endDate 가 빈 값인 경우가 있어(진행 중이 아닌데도) 구분자만 남지 않게 조립한다.
  const nowPeriod = now
    ? [now.startDate, now.inProgress ? "현재" : now.endDate].filter(Boolean).join(" — ")
    : ""

  // 빈 값이 섞이면 구분자만 남는다(`· 3분 읽기`). 조립해서 넘긴다.
  const latestMeta = latest
    ? [latest.date, `${readingMinutes(latest)}분 읽기`].filter(Boolean).join(" · ")
    : ""

  // Topics — 실제 태그 집계. 디자인의 숫자는 예시라 계산해서 넣는다.
  const tagCount = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1)
  const topics = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: AUTHOR.name,
          alternateName: AUTHOR.alternateName,
          jobTitle: AUTHOR.jobTitle,
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          sameAs: AUTHOR.sameAs,
        }}
      />

      {/* Masthead */}
      <section className="flex flex-col gap-6 pb-10 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-muted">Backend engineer · C#/.NET · Seoul</p>
          <h1 className="mt-3 text-[46px] font-bold leading-[1.06] tracking-[-0.032em] text-ink">
            Dev Log
          </h1>
          <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.8] text-muted">
            서버를 만들며 부딪힌 문제와 해결 과정을 기록합니다. 원인을 끝까지 파고, 결과는
            숫자로 남깁니다.
          </p>
        </div>

        {/*
          히어로에는 이력서 버튼만 둔다. RSS 는 푸터로 내렸다 — 채용 담당자를 겨냥한
          화면에서 구독 링크가 이력서와 같은 무게를 가질 이유가 없다.
        */}
        <div className="shrink-0">
          <Link href="/about/resume" className="btn-pill">
            이력서 보기 ⟶
          </Link>
        </div>
      </section>

      {/* 본문 — 최신 글 + aside */}
      <div className="grid gap-11 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* 좌 — 최신 글 */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
            <p className="eyebrow text-muted">Latest posts</p>
            <Link href="/writing" className="link-underline text-[13px]">
              전체 {posts.length}편 →
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">아직 작성된 글이 없습니다.</p>
          ) : (
            <>
              {/* 라임 최신 글 카드 */}
              <Link
                href={`/writing/${latest.slug}`}
                className="group mt-6 block rounded-[26px] bg-lime p-[26px] transition-colors hover:bg-[#CDEA55]"
                style={{ color: "var(--lime-body)" }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  {latest.category && (
                    <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white">
                      {latest.category}
                    </span>
                  )}
                  <span className="eyebrow" style={{ color: "var(--lime-ink)" }}>
                    {latestMeta}
                  </span>
                </div>

                <h2
                  className="mt-4 text-[29px] font-bold leading-[1.22]"
                  style={{ color: "var(--lime-ink)" }}
                >
                  {latest.title}
                </h2>
                {latest.summary && (
                  <p className="mt-3 text-[14.5px] leading-[1.8]">{latest.summary}</p>
                )}

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    {latest.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full bg-white/45 px-2.5 py-0.5 text-xs font-medium"
                        style={{ color: "var(--lime-ink)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span
                    aria-hidden
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors group-hover:bg-[#2A2B22]"
                  >
                    ⟶
                  </span>
                </div>
              </Link>

              {/* 텍스트 리스트 */}
              {list.length > 0 && (
                <div className="mt-2">
                  {list.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/writing/${post.slug}`}
                      className="group block border-b border-line py-5"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-[18px] font-bold leading-[1.4] text-ink">
                          {post.title}
                        </h3>
                        <time className="eyebrow shrink-0 text-muted">{post.date}</time>
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

              {hasMore && (
                <div className="mt-6">
                  <Link href="/writing" className="btn-pill">
                    글 더 보기 →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* 우 — aside 300px */}
        <aside className="flex flex-col gap-4">
          {now && (
            <div className="card-ink p-6">
              <p className="eyebrow flex items-center gap-1.5" style={{ color: "var(--on-ink-muted)" }}>
                <span aria-hidden className="text-lime">●</span>
                Now
              </p>
              <p className="mt-3 text-[14.5px] font-semibold text-white">{now.name}</p>
              {now.summary && (
                <p className="mt-1.5 text-[13px] leading-relaxed">{now.summary}</p>
              )}
              {nowPeriod && (
                <p className="eyebrow mt-3" style={{ color: "var(--on-ink-muted)" }}>
                  {nowPeriod}
                </p>
              )}
              <Link href="/work" className="eyebrow mt-4 inline-block text-lime">
                케이스 {groups.length}개 보기 →
              </Link>
            </div>
          )}

          {topics.length >= TOPICS_MIN && (
            <div className="rounded-[26px] bg-page p-6">
              <p className="eyebrow text-muted">Topics</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topics.map(([t, n], i) => (
                  <span
                    key={t}
                    className={
                      i === 0
                        ? "inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-0.5 text-xs font-semibold"
                        : "chip gap-1.5"
                    }
                    style={i === 0 ? { color: "var(--lime-ink)" } : undefined}
                  >
                    {t}
                    <span className="opacity-60">{n}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
