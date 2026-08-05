import Link from "next/link"
import { intro, skills } from "../../../components/home/homeData"

export const metadata = {
  title: "About",
  description: "오세준(Sejune Oh) — C#/.NET 백엔드 개발자 소개",
}

/*
  타임라인은 전폭으로 두고 카드 3개를 그 아래 3열로 내린다(화면 골격 결정 #154).
  타임라인이 이 화면의 주인공이고, Resume·Skills·Contact 는 타임라인을 읽으면서
  동시에 볼 정보가 아니라 다 읽은 뒤에 나오는 것이 맞다.

  경력 사실은 components/resumeDoc.tsx 에서 그대로 옮겨 적었다. 창작하지 않았다.
  같은 사실이 두 파일에 있게 되는데, 데이터로 빼려면 resumeDoc 을 고쳐야 하고
  그것은 이 이슈가 막고 있다("변경 파일 하나뿐" · "이력서 문서는 건드리지 않습니다").
  경력을 공유 데이터로 빼는 것은 후속 작업이다.
*/
const timeline: { org: string; period?: string; body: string }[] = [
  {
    org: "클라우드호스피탈",
    period: "2023.02 – 재직중",
    body: "React 프론트엔드로 입사 → 2024년 백엔드 전환 · 현재 백엔드 중심 풀스택 (병원 도메인 SaaS)",
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

export default function About() {
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

      {/* 타임라인 — 전폭. 가장 위(현재 재직)만 검정 카드 */}
      <section className="mt-12 flex flex-col gap-4">
        {timeline.map((t, i) => {
          const ink = i === 0
          return (
            <div
              key={t.org}
              className={
                ink
                  ? "card-ink grid gap-[22px] rounded-[22px] px-6 py-[22px] sm:grid-cols-[132px_minmax(0,1fr)]"
                  : "card grid gap-[22px] rounded-[22px] px-6 py-[22px] sm:grid-cols-[132px_minmax(0,1fr)]"
              }
            >
              {/* 기간은 고정폭. 검정 카드 안에서는 라임으로 */}
              <p className={`eyebrow ${ink ? "text-lime" : "text-muted"}`}>{t.period ?? "—"}</p>
              <div className="min-w-0">
                <p className={`text-[17px] font-bold ${ink ? "text-white" : "text-ink"}`}>
                  {t.org}
                </p>
                <p
                  className={`mt-2 text-[14.5px] leading-[1.8] ${
                    ink ? "" : "text-[color:var(--text-body)]"
                  }`}
                >
                  {t.body}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* 하단 3열 — 모바일에서는 1열 스택 */}
      <section className="mt-12 grid gap-4 lg:grid-cols-3">
        {/* 라임 Resume 카드 */}
        <div
          className="flex flex-col rounded-[22px] bg-lime p-6"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#2A2B22]"
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

        {/* 세이지 Contact 카드 — 고정폭 3줄 */}
        <div className="rounded-[22px] bg-page p-6">
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
