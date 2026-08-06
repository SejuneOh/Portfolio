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
    lib/notion.ts 매핑은 #146(PR #171)으로 들어왔다 — Notion 에 값이 채워져 있으면 흐른다.
    렌더하는 곳은 홈 로그 축의 계측 칸, 이 행 카드의 대표 수치, 케이스 상세의 계측 리드아웃.
    셋 다 세 값이 모두 있을 때만 내므로, 하나라도 비면 그 자리가 통째로 빠진다.
  */
  metricBefore?: string
  metricAfter?: string
  metricLabel?: string
  /*
    케이스 상세의 문제·접근 스코프박스용. metric 3종과 같은 자리에서 들어오는 값이고
    매핑도 같이 들어왔다(#146). 둘 다 비면 상세에서 3열이 통째로 빠진다.
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
  케이스 목록의 스코프박스. 계기판의 관측 창처럼 각진 테두리 안에 한 건씩 놓는다.
  목록은 스캔하는 화면이라 한 줄에 하나씩 두고 좌우로 정보를 나누는 편이 읽기 쉽다.
  진행 중인 케이스는 한 단 올라온 판(--surface-hover)으로 구분한다.

  이 박스의 얼굴은 커버 이미지가 아니라 수치다. 그래서 커버를 쓰지 않는다.
  수치는 Notion 매핑(#146)으로 들어온다. 세 값이 다 차 있지 않으면 우측은 CTA 만 남는다.
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
          ? "group grid gap-6 rounded-[3px] border border-line bg-surface-hover px-7 py-[26px] transition-colors hover:bg-[color:var(--border)] lg:grid-cols-[minmax(0,1fr)_300px]"
          : "group grid gap-6 rounded-[3px] border border-line bg-surface px-7 py-[26px] transition-colors hover:bg-surface-hover lg:grid-cols-[minmax(0,1fr)_300px]"
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

        {meta && <p className="eyebrow mt-3 text-muted">{meta}</p>}

        <h2 className="mt-2 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-ink">
          {data.name}
        </h2>

        {data.summary && (
          <p className="mt-2 max-w-[60ch] text-[14px] leading-[1.8] text-muted">{data.summary}</p>
        )}

        {data.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {data.tags.slice(0, 3).map((t) => (
              <span key={t.id} className="chip">
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/*
        우 — 계측 리드아웃과 CTA. 세 값(metricLabel·metricBefore·metricAfter)이 모두 있는
        첫 경험의 수치를 낸다. 하나라도 비면 이 블록이 빠지고 CTA 만 남는다.

        비례 막대(게이지)를 그리지 않는다. 수치가 자유 문자열이라 `91s`·`40ms`·`4%` 가
        섞이는데, 숫자만 파싱하면 단위가 다를 때 비율이 틀리고 "클수록 좋은" 값
        (예: 커버리지 4% → 92%)에서는 방향까지 뒤집힌다. 틀린 그림보다 정확한 수치가 낫다.
      */}
      <div className="flex flex-col justify-between gap-4 lg:border-l lg:border-line lg:pl-[26px]">
        {metric && (
          <div className="border-l-2 border-lime pl-4">
            <p className="eyebrow leading-[1.6] text-muted">{metric.metricLabel}</p>
            <p className="mt-2 font-[family-name:var(--font-jbmono)] text-[25px] leading-none">
              <span className="text-muted">{metric.metricBefore}</span>
              <span className="text-muted"> → </span>
              <span
                className="rounded-[3px] bg-lime px-[5px]"
                style={{ color: "var(--lime-ink)" }}
              >
                {metric.metricAfter}
              </span>
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
