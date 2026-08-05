import Link from "next/link"
import type { Block } from "../../lib/posts"
import { periodLabel } from "../../lib/date"

export interface ProjectTag {
  id: string
  name: string
}

// 하나의 "경험/기여"(Notion 행 1개). 여러 경험이 하나의 대분류 프로젝트로 묶인다.
export interface Experience {
  id: string
  projectName: string
  description: string
  cover: string
  tags: ProjectTag[]
  url: string
  startDate: string
  endDate: string
  status: boolean
  // 케이스스터디용 구조화 필드(선택). Notion 미설정 시 빈 값 → 상세에서 우아하게 폴백.
  impact?: string
  role?: string
  teamSize?: string
  liveUrl?: string
  /*
    개선 전·후 수치. 성과 문장(impact)에 묻혀 있던 값을 재사용할 수 있게 분리한 것이다.
    Notion 스키마 추가와 lib/notion.ts 매핑은 별도 작업이라 지금은 항상 undefined 다.
    이 값을 렌더하는 곳은 홈의 "기록해 둔 수치" 카드와 이 행 카드의 대표 수치이고
    둘 다 조건부라, 매핑이 들어오면 그때 나타난다.
  */
  metricBefore?: string
  metricAfter?: string
  metricLabel?: string
  /*
    케이스 상세의 문제·접근 타일용. metric 3종과 같은 자리에서 들어오는 값이고
    마찬가지로 아직 매핑이 없어 항상 undefined 다.
  */
  problem?: string
  approach?: string
  // 대분류(프로젝트) 그룹핑. group 미설정 시 이 경험이 독립 프로젝트가 된다.
  group?: string
  groupSummary?: string
  // 상세 페이지에서 채워지는 본문 블록.
  body?: Block[]
}

// 대분류(실제 프로젝트). 경험 여러 개를 묶는다.
export interface ProjectGroup {
  slug: string
  name: string
  summary: string
  cover: string
  tags: ProjectTag[]
  startDate: string
  endDate: string
  inProgress: boolean
  count: number
  experiences: Experience[]
}

// 그룹의 대표 수치 — 세 값이 모두 있는 첫 경험. 하나라도 비면 줄이 깨진다.
function representativeMetric(g: ProjectGroup) {
  return g.experiences.find((e) => e.metricLabel && e.metricBefore && e.metricAfter)
}

/*
  케이스 목록의 행 카드. 카드 그리드를 대체한다 — 목록은 스캔하는 화면이라
  한 줄에 하나씩 놓고 좌우로 정보를 나누는 편이 읽기 쉽다.

  카드의 얼굴은 커버 이미지가 아니라 수치다. 그래서 커버를 쓰지 않는다.
  다만 그 수치가 아직 데이터에 없으므로 우측은 지금 CTA 만 남는다.
*/
export default function CaseRow({ data }: { data: ProjectGroup }) {
  const metric = representativeMetric(data)
  const period = periodLabel(data.startDate, data.endDate, data.inProgress)
  const meta = [period, `경험 ${data.count}`].filter(Boolean).join(" · ")
  const ink = data.inProgress

  return (
    <Link
      href={`/work/${data.slug}`}
      className={
        ink
          ? "card-ink group grid gap-6 rounded-[26px] px-7 py-[26px] transition-colors hover:bg-[#2A2B22] lg:grid-cols-[minmax(0,1fr)_300px]"
          : "card group grid gap-6 rounded-[26px] px-7 py-[26px] transition-colors hover:bg-surface-hover lg:grid-cols-[minmax(0,1fr)_300px]"
      }
    >
      {/* 좌 */}
      <div className="min-w-0">
        {ink ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-[11px] font-semibold"
            style={{ color: "var(--lime-ink)" }}
          >
            <span aria-hidden>●</span> 진행 중
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[11px] font-medium text-muted">
            <span aria-hidden>○</span> 완료
          </span>
        )}

        {meta && (
          <p className="eyebrow mt-3" style={ink ? { color: "var(--on-ink-muted)" } : undefined}>
            {meta}
          </p>
        )}

        <h2
          className={`mt-2 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] ${
            ink ? "text-white" : "text-ink"
          }`}
        >
          {data.name}
        </h2>

        {data.summary && (
          <p
            className={`mt-2 max-w-[60ch] text-[14px] leading-[1.8] ${ink ? "" : "text-muted"}`}
          >
            {data.summary}
          </p>
        )}

        {data.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {data.tags.slice(0, 3).map((t) =>
              ink ? (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ border: "1px solid var(--on-ink-border)", color: "var(--on-ink-body)" }}
                >
                  {t.name}
                </span>
              ) : (
                <span key={t.id} className="chip">
                  {t.name}
                </span>
              )
            )}
          </div>
        )}
      </div>

      {/*
        우 — 대표 수치와 CTA. 수치 값이 아직 데이터에 없으므로 지금은 CTA 만 남는다.
        임시 값을 넣지 않는다. 매핑이 들어오면 수치와 라벨이 그대로 나타난다.
      */}
      <div
        className="flex flex-col justify-between gap-4 lg:border-l lg:pl-[26px]"
        style={ink ? { borderColor: "var(--on-ink-border)" } : { borderColor: "var(--border)" }}
      >
        {metric && (
          <div>
            <p className="font-[family-name:var(--font-jbmono)] text-[25px] leading-none">
              <span className={ink ? "" : "text-ink"}>{metric.metricBefore}</span>
              <span className={ink ? "" : "text-muted"}> → </span>
              <span
                className="rounded-[5px] bg-lime px-[5px]"
                style={{ color: "var(--lime-ink)" }}
              >
                {metric.metricAfter}
              </span>
            </p>
            <p
              className="eyebrow mt-3 leading-[1.6]"
              style={ink ? { color: "var(--on-ink-muted)" } : undefined}
            >
              {metric.metricLabel}
            </p>
          </div>
        )}

        <span
          className={
            ink
              ? "btn-lime w-fit"
              : "inline-flex w-fit items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors group-hover:bg-page"
          }
        >
          케이스 보기 →
        </span>
      </div>
    </Link>
  )
}
