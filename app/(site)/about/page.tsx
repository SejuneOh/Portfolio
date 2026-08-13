import Link from "next/link"
import { intro } from "../../../components/home/homeData"
import { getResume } from "../../../lib/notionResume"
import type { ResumeSkillRow } from "../../../lib/resumeData"

/*
  스킬은 이력서와 **같은 출처**를 읽는다 (#260 이 목표한 것).

  전에는 homeData.ts 에 따로 적혀 있었고, 그래서 실제로 갈라졌다 — 이력서에만 있는 항목이
  여섯 개, 이곳에만 있는 항목(`Docker`)이 하나였다. #259 에서 손으로 맞췄지만 손으로 맞춘 것은
  또 갈라진다.

  #262 1단계에서 두 화면이 같은 배열(lib/resumeData.ts)을 읽게 했는데, 2단계에서
  `/about/resume` 만 Notion 으로 옮겨 가면서 **다시 갈라졌다.** 관리 화면에서 저장하면
  이력서는 바뀌고 이곳은 다음 배포까지 컴파일된 값을 보여 줬다 — 검사에서 잡힌 결함이다.
  이제 이곳도 getResume() 을 부른다. 저장 후 revalidatePath("/about") 이 실제로 효과가 있다.

  그리는 방식은 각자다 — 이력서는 `primary` 를 굵게, 이곳은 `·` 로 이어 평문으로 둔다.
*/
function toSkillCard(rows: ResumeSkillRow[]) {
  return rows.map((s) => ({
    group: s.group,
    items: s.also ? `${s.primary} · ${s.also}` : s.primary,
  }))
}

export const metadata = {
  title: "About",
  description: "오세준(Sejune Oh) — C#/.NET 백엔드 개발자 소개",
}

/*
  타임라인은 전폭으로 두고 카드 3개를 그 아래 3열로 내린다(화면 골격 결정 #154).
  타임라인이 이 화면의 주인공이고, Resume·Skills·Contact 는 타임라인을 읽으면서
  동시에 볼 정보가 아니라 다 읽은 뒤에 나오는 것이 맞다.

  경력 사실은 components/resumeDoc.tsx 에서 그대로 옮겨 적었다. 창작하지 않았다.
  같은 사실이 두 파일에 있으므로 **한쪽만 고치면 다른 쪽이 조용히 낡는다.**
  실제로 그렇게 됐다 — #256 이 이력서의 어순을 바꾼 뒤 이곳이 옛 어순으로 남아 있었고,
  #259 에서 맞췄다. 공유 데이터로 빼는 일은 #260.
*/
const timeline: { org: string; period?: string; body: string }[] = [
  {
    org: "클라우드호스피탈",
    /*
      기간은 왼쪽 고정폭 칼럼이 이미 그린다. 그래서 본문에서 입사 연도를 되풀이하지 않는다
      — 이력서는 칼럼이 없어 `(2023 React 프론트엔드로 입사 → …)` 로 연도를 안에 적는다.
      두 문장이 다른 것은 이 차이 때문이고, 어순과 표현은 이력서에 맞췄다.
    */
    period: "2023.02 – 재직중",
    body: "병원 도메인 SaaS · 백엔드 중심 풀스택 (React 프론트엔드로 입사 → 2024 백엔드 전환)",
  },
  {
    org: "인지소프트",
    period: "2017.12 – 2021.07",
    body: "금융권 이미지 솔루션 SI · 개발/유지보수 (C#/.NET, Java)",
  },
  {
    org: "사이드 / 부트캠프 프로젝트",
    body: "농구 게스트 호스팅 · 렌탈 결제/백오피스 · 검색 웹 — React/TS · Nest.js · Node.js",
  },
]

export default async function About() {
  // 실패하면 코드 폴백으로 떨어진다(getResume 은 던지지 않는다). 화면은 항상 뜬다.
  const { data } = await getResume()
  const skills = toSkillCard(data.skills)

  return (
    <div>
      <header className="max-w-[60ch]">
        <p className="eyebrow text-muted">오세준 · Sejune Oh · Backend C#/.NET</p>
        <h1 className="mt-3 text-[52px] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
          오세준
        </h1>
        <div className="mt-6 space-y-5">
          {intro.map((p) => (
            <p key={p} className="text-[16px] leading-[1.85] text-[color:var(--text-body)]">
              {p}
            </p>
          ))}
        </div>
      </header>

      {/*
        타임라인 — 계측 축. 홈 로그 축(app/(site)/page.tsx)과 같은 어법을 쓴다:
        상태 점 레일(10px) + 고정폭 기간 컬럼 + 행마다 헤어라인.

        판을 나열하던 조판(card / card-ink + gap-4)을 버린 이유는, 어두운 지면에서
        판의 경계가 정보를 더 주지 않으면서 축을 끊기 때문이다. 경력은 시간 위의
        한 줄이므로 축이 맞다.

        기간은 <time> 에 넣지 않는다 — "2023.02 – 재직중"은 기계 판독 날짜가 아니고,
        datetime 없는 <time> 은 본문이 기계 판독이어야 한다는 규칙을 깬다(#181에서 같은 지적).
      */}
      <section className="mt-12">
        <div className="border-b border-line pb-3">
          <p className="eyebrow text-muted">Timeline — 경력</p>
        </div>

        <div className="flex flex-col">
          {timeline.map((t, i) => {
            const live = i === 0
            return (
              <div
                key={t.org}
                /*
                  컬럼을 모바일에도 명시한다. md: 에만 걸면 자동배치가 행 우선으로 돌아
                  본문이 10px 트랙에 떨어지고 글자가 한 자씩 세로로 쌓인다(#181에서 겪은 것).
                */
                className="grid grid-cols-[10px_minmax(0,1fr)] items-start gap-x-3 gap-y-2 border-b border-line py-5 md:grid-cols-[10px_132px_minmax(0,1fr)] md:gap-x-6"
              >
                {/* 상태 점 — 재직 중이면 라임으로 켠다 */}
                <span
                  aria-hidden
                  className={`mt-[7px] inline-block h-[7px] w-[7px] shrink-0 rounded-full border ${
                    live ? "border-lime bg-lime" : "border-line"
                  }`}
                />

                <p
                  className={`font-[family-name:var(--font-jbmono)] text-[11.5px] leading-[1.5] md:mt-[3px] ${
                    live ? "text-lime" : "text-muted"
                  }`}
                >
                  {t.period ?? "—"}
                </p>

                <div className="col-start-2 min-w-0 md:col-start-3">
                  {live && (
                    <span className="eyebrow text-[10.5px] text-lime">재직 중</span>
                  )}
                  <p className={`text-[17px] font-bold text-ink ${live ? "mt-1.5" : ""}`}>
                    {t.org}
                  </p>
                  {/*
                    이 문단은 이 파일에 적힌 값이라 Notion 자유 문자열이 아니다. 그래도
                    좁은 격자 칼럼 안의 산문이므로 같은 규칙을 준다 — 예외를 두면 다음에
                    누가 긴 식별자를 적었을 때 조용히 넘친다 (#214).
                  */}
                  <p className="mt-2 break-words text-[14.5px] leading-[1.8] text-[color:var(--text-body)]">
                    {t.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/*
        하단 3열 — 모바일에서는 1열 스택.

        items-start 를 준다 (#259). grid 기본값 stretch 는 세 카드를 가장 높은 카드에
        맞추는데, Skills 가 이력서 6행을 그대로 받으면서 길어져 라임 Resume 카드 가운데가
        크게 비고 Contact 아래로 죽은 공간이 생겼다. 높이를 맞추는 것은 #154 가 정한
        결정이 아니라 CSS 기본값이었으므로, 각 카드를 내용 높이대로 둔다.
      */}
      <section className="mt-12 grid items-start gap-4 lg:grid-cols-3">
        {/* 라임 Resume 카드 */}
        <div
          className="flex flex-col rounded-[3px] bg-lime p-6"
          style={{ color: "var(--lime-body)" }}
        >
          <p className="eyebrow" style={{ color: "var(--lime-ink)" }}>
            Resume
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed">
            경력·프로젝트·성과를 정리한 정식 이력서입니다.
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
            <Link
              href="/about/resume"
              className="inline-flex items-center gap-1.5 rounded-[3px] bg-page px-4 py-2 text-[13.5px] font-semibold text-ink transition-colors hover:bg-surface-hover"
            >
              이력서 열기 →
            </Link>
            {/* 인쇄는 이력서 화면에서 한다. 그 화면에 A4 print CSS 가 있다 */}
            <Link href="/about/resume" className="eyebrow" style={{ color: "var(--lime-ink)" }}>
              PDF 다운로드 ↓
            </Link>
          </div>
        </div>

        {/* 아웃라인 Skills 카드 */}
        <div className="card p-6">
          <p className="eyebrow text-muted">Skills</p>
          <dl className="mt-3 space-y-3">
            {skills.map((s) => (
              <div key={s.group}>
                <dt className="text-[13px] font-semibold text-ink">{s.group}</dt>
                <dd className="mt-1 text-[13px] leading-relaxed text-muted">{s.items}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/*
          Contact 카드 — 고정폭 3줄.
          이전에는 bg-page 였다. 밝은 지면 시절에는 지면색이 흰 표면 위에서 카드로 읽혔지만,
          어두운 지면에서는 지면과 같은 색이 되어(명암비 1.0:1) 테두리도 없이 사라졌다.
          Skills 와 같은 card 로 맞춘다 — 강조는 라임 Resume 카드 하나가 맡는다.
        */}
        <div className="card p-6">
          <p className="eyebrow text-muted">Contact</p>
          <div className="mt-3 space-y-1.5 font-[family-name:var(--font-jbmono)] text-[13px] leading-relaxed text-ink">
            <p>etry0715@gmail.com</p>
            <p>github.com/SejuneOh</p>
            <p>Seoul, Korea</p>
          </div>
          <Link href="/contact" className="link-underline mt-4 inline-block text-[13px]">
            문의 남기기 →
          </Link>
        </div>
      </section>
    </div>
  )
}
