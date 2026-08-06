import Link from "next/link"
import { getProjectGroups } from "../../lib/notion"
import { getPosts } from "../../lib/postsData"
import { readingMinutes } from "../../lib/posts"
import { fmtMonth, periodLabel } from "../../lib/date"
import JsonLd from "../../components/jsonLd"
import { SITE_URL, SITE_DESCRIPTION, AUTHOR } from "../../lib/site"

export const revalidate = 3600

// 로그 축에 거는 항목 수. 글과 케이스를 합쳐 센다.
const LOG_CAP = 8

// 태그 스트립은 이보다 적으면 렌더하지 않는다 — 칩 한두 개는 정보가 아니라 빈칸이다.
const TOPICS_MIN = 3

// 태그 스트립에 내는 최대 개수.
const TOPICS_CAP = 8

/*
  홈은 계측 로그다.

  이전에는 "라임 최신 글 카드 + 텍스트 리스트 + 우측 aside(Now·Topics·수치)" 3분할이었다.
  글과 케이스가 서로 다른 자리에 흩어져 있어 무엇이 언제 있었는지 한 줄로 읽히지 않았다.

  계측 콘솔에서는 **하나의 축**에 건다. 글이든 케이스든 같은 행 규격으로 놓고,
  진행 중인 것이 맨 위에 산다 — 이전의 "Now" 카드가 하던 일을 축의 첫 행이 대신한다.

  행 규격: [상태 점] [날짜] [종류·제목·요약·태그] [계측]
  Server Component 를 유지한다 — 데이터 페칭 방식은 바꾸지 않는다.
*/

type LogEntry = {
  key: string
  kind: "post" | "case"
  href: string
  title: string
  summary: string
  /** 정렬용. 비교 가능한 문자열이면 된다(ISO 날짜). */
  when: string
  dateLabel: string
  tags: string[]
  /** 진행 중 — 축 맨 위로 올리고 점을 라임으로 켠다 */
  live: boolean
  meta: string
  /** 세 값이 모두 있을 때만 채운다. 하나라도 비면 이 칸이 통째로 빠진다. */
  metric?: { label: string; before: string; after: string }
}

export default async function Home() {
  const [groups, posts] = await Promise.all([getProjectGroups(), getPosts()])

  const postEntries: LogEntry[] = posts.map((p) => ({
    key: `post:${p.slug}`,
    kind: "post",
    href: `/writing/${p.slug}`,
    title: p.title,
    summary: p.summary,
    when: p.date,
    // 케이스는 periodLabel 로 `2025.01 — 2026.07` 이 된다. 한 축의 같은 칸이므로 표기를 맞춘다.
    dateLabel: fmtMonth(p.date),
    tags: p.tags,
    live: false,
    // 카테고리는 이전 홈의 라임 카드가 배지로 내던 정보다. 축에서는 메타 줄에 남긴다.
    meta: [p.category, `${readingMinutes(p)}분 읽기`].filter(Boolean).join(" · "),
  }))

  const caseEntries: LogEntry[] = groups.map((g) => {
    // 그룹의 대표 수치 — 세 값이 모두 있는 첫 경험. 하나라도 비면 줄이 깨진다.
    const m = g.experiences.find((e) => e.metricLabel && e.metricBefore && e.metricAfter)
    return {
      key: `case:${g.slug}`,
      kind: "case",
      href: `/work/${g.slug}`,
      title: g.name,
      summary: g.summary,
      when: g.endDate || g.startDate,
      dateLabel: periodLabel(g.startDate, g.endDate, g.inProgress),
      tags: g.tags.map((t) => t.name),
      live: g.inProgress,
      meta: g.count > 1 ? `경험 ${g.count}` : "",
      metric: m
        ? { label: m.metricLabel!, before: m.metricBefore!, after: m.metricAfter! }
        : undefined,
    }
  })

  /*
    진행 중인 것을 맨 위로, 나머지는 최신순. Work 목록의 정렬 규칙과 같게 맞춘다 —
    같은 데이터가 화면마다 다른 순서로 보이면 안 된다.
  */
  const log = [...postEntries, ...caseEntries]
    .sort((a, b) => {
      if (a.live !== b.live) return a.live ? -1 : 1
      return (b.when || "").localeCompare(a.when || "")
    })
    .slice(0, LOG_CAP)

  const postCount = posts.length
  const caseCount = groups.length
  const liveCount = groups.filter((g) => g.inProgress).length

  /*
    "더 보기"는 /writing 으로 가므로 **글 기준으로만** 센다.
    합계로 세면 케이스가 많을 때 글이 이미 다 나와 있어도 버튼이 뜨고, 눌러도 같은 글뿐인
    막힌 링크가 된다.
  */
  const shownPosts = log.filter((e) => e.kind === "post").length
  const hasMore = postEntries.length > shownPosts

  // 태그 집계 — 글의 태그만 센다. 케이스 태그는 스택이라 성격이 다르다.
  const tagCount = new Map<string, number>()
  for (const p of posts) for (const t of p.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1)
  const topics = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOPICS_CAP)

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

      {/* 머리단 */}
      <section className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
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

      {/*
        채널 스트립 — 축에 무엇이 몇 개 걸려 있는지. 계기판의 상단 표시부에 해당한다.
        값이 0 인 채널도 낸다. 0 이라는 사실 자체가 정보다.
      */}
      <div className="mt-9 grid grid-cols-3 border border-line bg-surface font-[family-name:var(--font-jbmono)]">
        {[
          { label: "Cases", value: caseCount },
          { label: "Posts", value: postCount },
          { label: "Live", value: liveCount, lit: liveCount > 0 },
        ].map((ch, i) => (
          <div
            key={ch.label}
            className={`flex items-center gap-2 px-4 py-2.5 ${i < 2 ? "border-r border-line" : ""}`}
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${ch.lit ? "bg-lime" : "bg-line"}`}
            />
            <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">{ch.label}</span>
            <span className="ml-auto text-[13px] text-ink">{ch.value}</span>
          </div>
        ))}
      </div>

      {/* 태그 스트립 — 칩이 세 개 미만이면 내지 않는다 */}
      {topics.length >= TOPICS_MIN && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1 text-muted">Topics</span>
          {topics.map(([t, n], i) => (
            <span
              key={t}
              className={
                i === 0
                  ? /*
                       1등 토픽만 라임이다. chip 유틸을 쓰지 않으므로 같은 처리를 직접 준다 (#214).
                       inline-flex 에서는 break-words 가 아니라 overflow-wrap:anywhere 여야 한다 —
                       break-word 는 min-content 를 줄이지 않아 익명 flex 아이템이 토큰 전체 폭을
                       요구하고, 그러면 max-w-full 로 묶어도 글자가 삐져나간다.
                     */
                    "inline-flex max-w-full items-center gap-1.5 rounded-[3px] bg-lime px-2.5 py-0.5 text-xs font-semibold [overflow-wrap:anywhere]"
                  : "chip gap-1.5"
              }
              style={i === 0 ? { color: "var(--lime-ink)" } : undefined}
            >
              {t}
              <span className="opacity-60">{n}</span>
            </span>
          ))}
        </div>
      )}

      {/* 로그 축 */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <p className="eyebrow text-muted">Log — 글과 케이스</p>
          <div className="flex gap-4">
            <Link href="/writing" className="link-underline text-[13px]">
              글 전체
            </Link>
            <Link href="/work" className="link-underline text-[13px]">
              케이스 전체
            </Link>
          </div>
        </div>

        {log.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">아직 기록이 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            {log.map((e) => (
              <Link
                key={e.key}
                href={e.href}
                className="group grid grid-cols-[10px_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-b border-line py-5 transition-colors hover:bg-surface md:grid-cols-[10px_112px_minmax(0,1fr)_auto] md:gap-x-6"
              >
                {/* 상태 점 — 진행 중이면 라임으로 켠다 */}
                <span
                  aria-hidden
                  className={`mt-[7px] inline-block h-[7px] w-[7px] rounded-full border ${
                    e.live ? "border-lime bg-lime" : "border-line"
                  }`}
                />

                {/* 날짜 — md 이상에서 고정폭 112px. 모바일에서는 점 옆에 남고 본문이 그 아래로 내려간다 */}
                {e.when ? (
                  <time
                    dateTime={e.when}
                    className="font-[family-name:var(--font-jbmono)] text-[11.5px] leading-[1.5] text-muted md:mt-[3px]"
                  >
                    {e.dateLabel}
                  </time>
                ) : e.dateLabel ? (
                  /*
                    라벨은 있는데 정렬용 날짜가 없는 경우 — periodLabel 은 진행 중이면
                    시작일이 없어도 "현재" 를 낸다. <time> 은 datetime 이 없으면 본문이
                    기계 판독 날짜여야 하므로 그 자리에는 쓰지 않는다.
                  */
                  <span className="font-[family-name:var(--font-jbmono)] text-[11.5px] leading-[1.5] text-muted md:mt-[3px]">
                    {e.dateLabel}
                  </span>
                ) : (
                  <span aria-hidden />
                )}

                {/*
                  컬럼을 모바일에도 명시한다. md: 에만 걸면 자동배치가 행 우선으로 돌아
                  본문이 2행 1열(10px 트랙)로 떨어지고 글자가 한 자씩 세로로 쌓인다.
                */}
                <div className="col-start-2 min-w-0 md:col-start-3">
                  <span className="font-[family-name:var(--font-jbmono)] text-[10.5px] uppercase tracking-[0.18em] text-lime">
                    {e.kind === "case" ? "Case" : "Post"}
                  </span>
                  {/* 케이스 이름·글 제목·요약은 Notion 자유 문자열이다 — 긴 토큰을 끊는다 (#214) */}
                  <h2 className="mt-1.5 break-words text-[18px] font-bold leading-[1.4] text-ink transition-colors group-hover:text-lime">
                    {e.title}
                  </h2>
                  {e.summary && (
                    <p className="mt-1.5 break-words text-[14px] leading-[1.8] text-muted">
                      {e.summary}
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {e.meta && <span className="eyebrow text-muted">{e.meta}</span>}
                    {e.tags.slice(0, 3).map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/*
                  계측 칸 — 세 값이 모두 있을 때만 나온다. 하나라도 비면 이 칸이 통째로 빠지고
                  임시 값을 넣지 않는다. 값은 Notion 매핑(#146)으로 들어온다.
                */}
                {e.metric && (
                  <div className="col-start-2 font-[family-name:var(--font-jbmono)] md:col-start-4 md:text-right">
                    <p className="text-[15px] leading-none text-ink">
                      <span className="text-muted">{e.metric.before}</span>
                      <span className="text-muted"> → </span>
                      <span
                        className="rounded-[3px] bg-lime px-[5px]"
                        style={{ color: "var(--lime-ink)" }}
                      >
                        {e.metric.after}
                      </span>
                    </p>
                    <p className="eyebrow mt-2 text-muted">{e.metric.label}</p>
                  </div>
                )}
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
      </section>
    </>
  )
}
