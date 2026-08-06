import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProjectGroups, getProjectGroup } from "../../../../lib/notion"
import type { Experience } from "../../../../components/projects/caseRow"
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
  계측 리드아웃 — 라임 좌측 눈금. 세 값이 모두 있을 때만 낸다. 하나라도 비면
  `91s → ` 처럼 화살표만 남으므로 통째로 빠뜨린다. 값은 Notion 매핑(#146)으로 들어온다.

  목록(components/projects/caseRow.tsx)의 리드아웃과 같은 규격이다 — 라벨이 위,
  수치가 아래, 개선 후 값에만 라임 배경. 같은 값이 화면마다 다르게 보이면 안 된다.
  비례 막대를 그리지 않는 이유도 그쪽 주석에 적어 두었다.
*/
function MetricLine({ e }: { e: Experience }) {
  if (!e.metricLabel || !e.metricBefore || !e.metricAfter) return null
  return (
    <div className="mt-5 border-l-2 border-lime pl-4">
      <p className="eyebrow leading-[1.6] text-muted">{e.metricLabel}</p>
      <p className="mt-2 font-[family-name:var(--font-jbmono)] text-[22px] leading-none">
        <span className="text-muted">{e.metricBefore}</span>
        <span className="text-muted"> → </span>
        <span className="rounded-[3px] bg-lime px-[5px]" style={{ color: "var(--lime-ink)" }}>
          {e.metricAfter}
        </span>
      </p>
    </div>
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
    문제 / 접근 / 결과 3열 스코프박스.

    problem 과 approach 가 **둘 다** 비면 이 블록 전체를 렌더하지 않는다 —
    결과 하나만 남으면 3열 그리드가 의미를 잃는다. 본문에서 추측해 채우거나
    임시 문구를 넣지 않는다. 값이 들어오면 그대로 나타난다.
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
          <div className="relative mt-6 aspect-2/1 w-full overflow-hidden rounded-[3px] border border-line">
            <Image src={group.cover} alt="" fill sizes="720px" unoptimized className="object-cover" priority />
          </div>
        )}

        {/*
          케이스 이름에는 `CloudHospital.Api.Gateway` 처럼 끊기지 않는 긴 토큰이 들어온다.
          근본 원인은 글자 크기가 아니라 토큰이 안 끊긴다는 것이므로 break-words 로 끊는다.
          clamp 는 큰 화면의 인상을 유지하면서 좁은 화면에서 줄이는 보조 장치다.
        */}
        <h1 className="mt-6 break-words text-[clamp(28px,8vw,46px)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
          {group.name}
        </h1>

        {heroLead && (
          <p className="mt-4 text-[18px] font-medium leading-[1.7] text-ink">{heroLead}</p>
        )}

        {showTiles && (
          /*
            문제·접근·결과 스코프박스. 각진 테두리에 라벨을 붙여 계기판의 관측 창처럼 읽히게 한다.
            결과만 라임 좌측 눈금으로 강조한다 — 이 화면에서 가장 중요한 칸이다.
          */
          <div className="mt-8 grid grid-cols-1 gap-[14px] sm:grid-cols-3">
            {[
              { label: "문제", body: problem, lit: false },
              { label: "접근", body: approach, lit: false },
              { label: "결과", body: outcome, lit: true },
            ]
              /*
                값이 있는 칸만 낸다. 이전 타일은 테두리가 없어(bg-page) 빈 칸이 보이지 않았지만
                스코프박스는 테두리를 그으므로, 셋 중 하나만 차면 빈 액자가 남는다.
                특히 결과 칸은 라임 눈금이 붙은 채로 비어 "가장 중요한 칸이 비었다" 로 읽힌다.
              */
              .filter((t) => t.body)
              .map((t) => (
                <div
                  key={t.label}
                  className={`rounded-[3px] border border-line bg-surface p-[18px] ${
                    t.lit ? "border-l-2 border-l-lime" : ""
                  }`}
                >
                  <p className={`eyebrow ${t.lit ? "text-lime" : "text-muted"}`}>{t.label}</p>
                  <p className="mt-2 break-words text-[14px] leading-[1.7] text-[color:var(--text-body)]">
                    {t.body}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* 경험 블록 */}
        {group.experiences.map((e, i) => (
          <section key={e.id} className="mt-10 border-t border-line pt-[26px]">
            {group.count > 1 && (
              <span
                className="inline-flex items-center rounded-[3px] bg-lime px-3 py-1 text-[11px] font-semibold"
                style={{ color: "var(--lime-ink)" }}
              >
                경험 {i + 1}
              </span>
            )}

            <h2 className="mt-3 text-[26px] font-bold leading-[1.25] tracking-[-0.02em] text-ink">
              {e.projectName}
            </h2>

            {/*
              이 두 문단은 아래 PostBody 와 같은 읽기 칼럼에 이어진다. #183 이 본문 문단을
              세리프로 바꿨으므로 여기도 세리프여야 한다 — 고딕으로 두면 같은 칼럼 안에서
              리드 문단만 서체가 달라 위계가 아니라 어긋남으로 읽힌다.

              규칙은 "읽는 흐름의 산문은 세리프, 구조·메타·라벨은 고딕" 이다(app/layout.tsx).
            */}
            {e.impact?.trim() && (
              <p className="mt-3 font-[family-name:var(--font-serif)] text-[15.5px] leading-[1.8] text-ink">
                {e.impact.trim()}
              </p>
            )}
            {e.description?.trim() && e.description.trim() !== e.impact?.trim() && (
              <p className="mt-2 font-[family-name:var(--font-serif)] text-[15px] leading-[1.8] text-muted">
                {e.description.trim()}
              </p>
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
        {/* 메타 판 — 각진 테두리 */}
        <div className="rounded-[3px] border border-line bg-surface p-6">
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

        {/* 한 단 올라온 CTA 판 */}
        <div className="rounded-[3px] border border-line bg-surface-hover p-6">
          <p className="text-[14.5px] font-semibold leading-relaxed text-ink">
            비슷한 문제를 겪고 있다면
          </p>
          {/*
            card-ink 유틸은 color: var(--text-body) 도 함께 주고 있었다. 각진 판으로 펴면서
            그 선언이 사라져 이 문단이 --ink 를 상속해 제목과 같은 색이 됐다. 명시한다.
          */}
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--text-body)]">
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
