import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProjectGroups, getProjectGroup } from "../../../../lib/notion"
import type { Experience } from "../../../../components/projects/projectItem"
import PostBody from "../../../../components/postBody"
import { SITE_URL } from "../../../../lib/site"
import { periodLabel } from "../../../../lib/date"

export const revalidate = 3600

export async function generateStaticParams() {
  const groups = await getProjectGroups()
  return groups.map((g) => ({ id: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const group = await getProjectGroup(id)
  if (!group) return {}
  const url = `${SITE_URL}/work/${id}`
  const desc = group.summary || group.experiences[0]?.impact || undefined
  return {
    title: group.name,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: group.name, description: desc },
  }
}

// 경험 하나의 기간 문자열. 진행 중이면 끝이 "현재" 가 된다(status=true 가 완료).
function periodOf(e: Experience) {
  return periodLabel(e.startDate, e.endDate, !e.status)
}

/*
  계측 라인 — 라임 3px 좌측 보더. 세 값이 모두 있을 때만 낸다. 하나라도 비면
  `91s → ` 처럼 화살표만 남는다. 값은 Notion 매핑이 들어와야 채워진다.
*/
function MetricLine({ e }: { e: Experience }) {
  if (!e.metricLabel || !e.metricBefore || !e.metricAfter) return null
  return (
    <p
      className="mt-5 border-l-[3px] border-lime py-1 pl-4 font-[family-name:var(--font-jbmono)] text-[15px] leading-relaxed text-ink"
      style={{ borderLeftWidth: 3 }}
    >
      <span className="text-muted">{e.metricLabel} </span>
      {e.metricBefore} → {e.metricAfter}
    </p>
  )
}

export default async function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = await getProjectGroup(id)
  if (!group) notFound()

  const lead = group.experiences[0]
  const groupPeriod = periodLabel(group.startDate, group.endDate, group.inProgress)

  // 리드 문장 — 그룹 요약이 우선, 없으면 첫 경험의 성과 문장.
  const heroLead = group.summary?.trim() || lead?.impact?.trim() || ""

  /*
    문제 / 접근 / 결과 3타일.

    "문제"와 "접근" 데이터가 아직 없다. 두 값이 모두 없으면 타일 전체를 렌더하지
    않는다 — 결과 하나만 남으면 3열 그리드가 의미를 잃는다. 본문에서 추측해
    채우거나 임시 문구를 넣지 않는다. 값이 들어오면 그대로 나타난다.
  */
  const problem = lead?.problem?.trim()
  const approach = lead?.approach?.trim()
  const outcome = lead?.impact?.trim()
  const showTiles = Boolean(problem || approach)

  return (
    <div className="grid gap-11 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* 본문 */}
      <article className="min-w-0 max-w-[720px]">
        <Link
          href="/work"
          className="font-[family-name:var(--font-jbmono)] text-xs text-ink transition-colors hover:text-muted"
        >
          ← Work
        </Link>

        {/*
          커버는 이 이슈의 규격에 없지만 기존 화면에 있던 콘텐츠라 유지한다.
          빼는 것은 사람 판단이라 임의로 지우지 않았다.
        */}
        {group.cover && (
          <div className="relative mt-6 aspect-2/1 w-full overflow-hidden rounded-[18px] border border-line">
            <Image src={group.cover} alt="" fill sizes="720px" unoptimized className="object-cover" priority />
          </div>
        )}

        <h1 className="mt-6 text-[46px] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
          {group.name}
        </h1>

        {heroLead && (
          <p className="mt-4 text-[18px] font-medium leading-[1.7] text-ink">{heroLead}</p>
        )}

        {showTiles && (
          <div className="mt-8 grid grid-cols-1 gap-[14px] sm:grid-cols-3">
            {[
              { label: "문제", body: problem, lime: false },
              { label: "접근", body: approach, lime: false },
              { label: "결과", body: outcome, lime: true },
            ].map((t) => (
              <div
                key={t.label}
                className={`rounded-[18px] p-[18px] ${t.lime ? "bg-lime" : "bg-page"}`}
                style={t.lime ? { color: "var(--lime-body)" } : undefined}
              >
                <p className="eyebrow" style={t.lime ? { color: "var(--lime-ink)" } : undefined}>
                  {t.label}
                </p>
                {t.body && <p className="mt-2 text-[14px] leading-[1.7]">{t.body}</p>}
              </div>
            ))}
          </div>
        )}

        {/* 경험 블록 */}
        {group.experiences.map((e, i) => (
          <section key={e.id} className="mt-10 border-t border-line pt-[26px]">
            {group.count > 1 && (
              <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-white">
                경험 {i + 1}
              </span>
            )}

            <h2 className="mt-3 text-[26px] font-bold leading-[1.25] tracking-[-0.02em] text-ink">
              {e.projectName}
            </h2>

            {e.impact?.trim() && (
              <p className="mt-3 text-[15.5px] leading-[1.8] text-ink">{e.impact.trim()}</p>
            )}
            {e.description?.trim() && e.description.trim() !== e.impact?.trim() && (
              <p className="mt-2 text-[15px] leading-[1.8] text-muted">{e.description.trim()}</p>
            )}

            <MetricLine e={e} />

            {(e.liveUrl || e.url) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {e.liveUrl && (
                  <a href={e.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-pill">
                    라이브 데모 ↗
                  </a>
                )}
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="btn-pill">
                    Repository ↗
                  </a>
                )}
              </div>
            )}

            {e.body && e.body.length > 0 && (
              <div className="mt-6">
                <PostBody blocks={e.body} />
              </div>
            )}
          </section>
        ))}
      </article>

      {/* 사이드 */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        {/* 세이지 메타 카드 */}
        <div className="rounded-[26px] bg-page p-6">
          <dl className="space-y-4">
            {groupPeriod && (
              <div>
                <dt className="eyebrow text-muted">기간</dt>
                <dd className="mt-1 text-sm text-ink">{groupPeriod}</dd>
              </div>
            )}
            {lead?.role?.trim() && (
              <div>
                <dt className="eyebrow text-muted">역할</dt>
                <dd className="mt-1 text-sm text-ink">{lead.role.trim()}</dd>
              </div>
            )}
            {lead?.teamSize?.trim() && (
              <div>
                <dt className="eyebrow text-muted">팀</dt>
                <dd className="mt-1 text-sm text-ink">{lead.teamSize.trim()}</dd>
              </div>
            )}
            {group.tags.length > 0 && (
              <div>
                <dt className="eyebrow text-muted">스택</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {group.tags.map((t) => (
                    <span key={t.id} className="chip">
                      {t.name}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/*
          "이 케이스에서 나온 글" 카드는 만들지 않았다. 케이스와 글을 잇는 데이터가
          없고, 태그가 겹치는 글을 끌어오는 식의 규칙을 지어내면 그것은 연결이
          아니라 추측이다. 연결 데이터가 생기면 여기에 카드를 넣는다.
        */}

        {/* 검정 CTA 카드 */}
        <div className="card-ink p-6">
          <p className="text-[14.5px] font-semibold leading-relaxed text-white">
            비슷한 문제를 겪고 있다면
          </p>
          <p className="mt-2 text-[13px] leading-relaxed">
            어떤 상황인지 한 줄만 적어주셔도 됩니다.
          </p>
          <Link href="/contact" className="btn-lime mt-4">
            문의 →
          </Link>
        </div>
      </aside>
    </div>
  )
}
