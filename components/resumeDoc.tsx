"use client"

import React from "react"
import Link from "next/link"
import { Instrument_Sans } from "next/font/google"

import { tokenizeInline } from "../lib/inlineTokens"
import { RESUME_SECTIONS, resumeData, type ResumeBullet } from "../lib/resumeData"

// 이력서 고유 서체 — next/font로 로드(렌더블로킹 <link> 제거, no-page-custom-font 해소).
const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-instrument", display: "swap" })

/**
 * 정식 이력서 페이지 (/about/resume)
 * 홈/글이 "개성 있는 에디토리얼"이라면, 이 페이지는 정규화된 공식 문서다.
 * - 화면에서는 (site) 레이아웃(계측 배경 위의 라벨 바·본문·푸터) 안에 놓인다.
 *   #180 이전에는 흰 표면 프레임(rounded bg-surface) 안이었으나 지금은 그 프레임이 없다
 * - 인쇄할 때는 그 크롬을 숨기고 문서만 남긴다. 규칙은 이 파일이 아니라 크롬 쪽에 있다 —
 *   components/{topNav,mobileHeader,footer}.tsx 의 print:hidden 과
 *   app/(site)/layout.tsx 의 print:* (여백·최대폭 해제. 벗길 표면도 라운드도 이제 없다)
 * - 디스플레이·고정폭 서체는 app/layout.tsx 의 전역 인스턴스를 상속받는다.
 *   본문 서체(Instrument Sans)만 이 문서 고유라 여기서 로드한다
 * - PDF 다운로드 = 브라우저 인쇄(A4 최적화 print CSS)
 *
 * 강조 규칙 (#256 에서 정함 — 항목을 추가할 때 지킬 것)
 * - <b> 는 한 항목에 하나. 그 항목의 결과에만 쓴다. 기술 이름에는 쓰지 않는다.
 *   전에는 한 줄에 최대 5개가 겹쳐 있어서 무엇이 성과인지 눈으로 골라낼 수 없었다
 * - .kbd 는 재서 확인한 전후 값 전용(`194 → 3ms`). 기술 이름에 쓰면 측정값과 구분되지 않는다
 * - .yr 는 항목의 연도. 같은 프로젝트를 여러 해에 걸쳐 소유한 경우 순서를 드러낸다
 *
 * 내용은 이 파일에 없다 — lib/resumeData.ts 다 (#262 1단계). 이 파일은 **그리는 규칙만**
 * 소유한다: 섹션 구성과 순서, 연도 칩 정렬, 강조 표기의 매핑, 회사 사이 여백, 인쇄 조판.
 * 2단계에서 데이터 출처가 Notion 으로 바뀌어도 이 파일은 그대로다.
 */

/*
  본문 표기를 이력서용 요소로 바꾼다. 쪼개는 것은 lib/inlineTokens.ts 가 하고(블로그 본문과
  같은 스캐너), 여기서는 매핑만 한다 — 블로그는 Tailwind 클래스, 이력서는 이 파일의 styled-jsx.

      **결과**      → <b>       항목당 하나 (#256)
      `194 → 3ms`   → .kbd 칩   측정값 전용 (#256)
*/
function renderResumeInline(text: string): React.ReactNode {
  return tokenizeInline(text).map((t, i) => {
    if (t.kind === "bold") return <b key={i}>{t.text}</b>
    if (t.kind === "code")
      return (
        <span className="kbd" key={i}>
          {t.text}
        </span>
      )
    if (t.kind === "link")
      return (
        <a href={t.href} key={i}>
          {t.text}
        </a>
      )
    return t.text
  })
}

/*
  연도 칸. 한 목록 안에 연도가 있는 항목과 없는 항목이 섞이면, 없는 쪽에도 **빈 칸**을 준다 —
  없으면 본문 시작 위치가 두 갈래로 갈려 왼쪽 선이 들쭉날쭉해진다 (#256).
  목록 전체에 연도가 하나도 없으면 칸 자체를 만들지 않는다.
*/
function BulletList({ bullets }: { bullets: ResumeBullet[] }) {
  const anyYear = bullets.some((b) => b.year)
  return (
    <ul>
      {bullets.map((b, i) => (
        <li key={i}>
          {anyYear &&
            (b.year ? (
              /*
                연도 뒤의 공백 한 칸은 장식이 아니다 — 원본 JSX 에 있던 것이고, 빼면
                복사한 텍스트가 "2024실시간…" 으로 붙는다. 빈 칸(아래)에는 원본에도
                공백이 없었으므로 넣지 않는다. 데이터로 옮기면서 실제로 한 번 잃었다가
                렌더 대조에서 잡았다 (#262).
              */
              <>
                <span className="yr">{b.year}</span>{" "}
              </>
            ) : (
              <span className="yr" aria-hidden="true" />
            ))}
          {renderResumeInline(b.text)}
        </li>
      ))}
    </ul>
  )
}

export default function ResumeDoc() {
  const { header, metrics, skills, career, side, education, footer } = resumeData

  /*
    각 항목이 몇 번째 회사에 속하는지 미리 센다. 회사가 바뀔 때만 위 여백을 주는데,
    첫 회사에는 주지 않는다 — 그 위가 섹션 머리다.

    처음에는 map 안에서 카운터를 하나 두고 늘렸다가 lint 에 걸렸다
    (react-hooks/immutability — "렌더가 끝난 뒤 변수를 다시 대입할 수 없다").
    콜백이 언제 돌지 보장되지 않으므로 정당한 지적이다. 규칙을 끄지 않고 순수 계산으로 바꿨다.
    항목이 여덟 개라 비용은 문제가 되지 않는다.
  */
  const jobsUpTo = career.map(
    (_, i) => career.slice(0, i + 1).filter((x) => x.kind === "job").length
  )

  return (
    <>

      <div className={`resume-page ${instrument.variable}`}>
        <div className="sheet">
          <Link href="/" className="backlink">← Portfolio</Link>

          <header>
            <div className="eyebrow">{header.eyebrow}</div>
            <h1>
              {header.name}
              <span className="en">{header.nameSub}</span>
            </h1>
            {/*
              담백하게 둔다 — 굵은 강조도 수치도 쓰지 않는다 (#256).
              역할·경력 연수는 위 아이브로우·이름 아래 줄·아래 연락처 줄이 이미 말하고 있어서,
              여기서 되풀이하면 세 번 같은 말을 하게 된다.
            */}
            <p className="tagline">{header.tagline}</p>
            <div className="contacts">
              {header.contacts.map((c) =>
                c.href ? (
                  <a
                    key={c.text}
                    href={c.href}
                    {...(/^https?:\/\//.test(c.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {c.text}
                  </a>
                ) : (
                  <span key={c.text}>{c.text}</span>
                )
              )}
            </div>
          </header>

          <div className="metrics" aria-label="핵심 성과 지표">
            {metrics.map((m) => (
              <div className="metric" key={m.value + m.label[0]}>
                <div className="big">
                  {m.from && <span className="from">{m.from}</span>}
                  {m.arrow && <span className="arw">→</span>}
                  {m.value}
                  {m.after && (
                    <span
                      className="from"
                      {...(m.afterSmall ? { style: { fontSize: ".5em" } } : {})}
                    >
                      {m.after}
                    </span>
                  )}
                </div>
                <div className="lbl">
                  {m.label.map((line, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 핵심 역량 — 굵은 쪽이 주로 쓰는 것, `·` 뒤가 함께 쓰는 것이다 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">{RESUME_SECTIONS.skills.num}</div>
              <h2 className="sec-title">{RESUME_SECTIONS.skills.title}</h2>
            </div>
            <div className="sec-body">
              {skills.map((s) => (
                <div className="skill-row" key={s.group}>
                  <div className="k">{s.group}</div>
                  <div className="v">
                    <b>{s.primary}</b>
                    {s.also ? ` · ${s.also}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 경력 — 회사(.job)와 프로젝트(.proj)가 한 줄로 섞여 순서대로 나온다 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">{RESUME_SECTIONS.career.num}</div>
              <h2 className="sec-title">{RESUME_SECTIONS.career.title}</h2>
            </div>
            <div className="sec-body">
              {career.map((e, i) => {
                if (e.kind === "job") {
                  return (
                    <div
                      className="job"
                      key={e.org}
                      {...(jobsUpTo[i] > 1 ? { style: { marginTop: 34 } } : {})}
                    >
                      <div className="job-top">
                        <div className="job-org">{e.org}</div>
                        {e.when && <div className="job-when">{e.when}</div>}
                      </div>
                      {/*
                        job-role 과 job-note 가 같은 말(입사 → 백엔드 전환)을 두 번 하고 있었다.
                        한 줄로 합치고 job-note 는 없앴다 (#256).
                      */}
                      {e.role && <div className="job-role">{e.role}</div>}
                    </div>
                  )
                }

                /*
                  두 번째 회사 아래 첫 블록만 위 여백을 좁힌다. 첫 회사의 첫 블록은
                  .proj:first-of-type 이 맡으므로 여기서 주지 않는다 (그러면 값이 겹친다).
                */
                const afterLaterJob = career[i - 1]?.kind === "job" && jobsUpTo[i] > 1
                return (
                  <div
                    className="proj"
                    key={e.name || `proj-${i}`}
                    {...(afterLaterJob ? { style: { marginTop: 14 } } : {})}
                  >
                    {(e.name || e.when) && (
                      <div className="proj-name">
                        {e.star && <span className="star">◆</span>}
                        {e.star ? ` ${e.name} ` : `${e.name} `}
                        {e.when && <span className="pwhen">{e.when}</span>}
                      </div>
                    )}
                    {e.desc && <div className="proj-desc">{e.desc}</div>}
                    <BulletList bullets={e.bullets} />
                  </div>
                )
              })}
            </div>
          </section>

          {/*
            사이드 프로젝트는 경력 안에서 회사 블록(.job + .job-org)을 재사용해 그려지고 있었다.
            근무 기간이 없는 회사처럼 보이고 실무 경력과 섞였다. 자체 섹션으로 분리했다 (#256).
          */}
          <section>
            <div className="sec-head">
              <div className="sec-num">{RESUME_SECTIONS.side.num}</div>
              <h2 className="sec-title">{RESUME_SECTIONS.side.title}</h2>
            </div>
            <div className="sec-body">
              <ul>
                {side.map((s, i) => (
                  <li key={i}>{renderResumeInline(s)}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* 학력 / 교육 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">{RESUME_SECTIONS.education.num}</div>
              <h2 className="sec-title">{RESUME_SECTIONS.education.title}</h2>
            </div>
            <div className="sec-body">
              {education.map((e) => (
                <div className="edu-item" key={e.name}>
                  <div className="edu-name">{e.name}</div>
                  <div className="edu-meta">{e.meta}</div>
                  {e.desc && <div className="edu-desc">{e.desc}</div>}
                </div>
              ))}
            </div>
          </section>

          <footer>
            <span>{footer[0]}</span>
            <span>{footer[1]}</span>
          </footer>
        </div>

        <button className="dl" onClick={() => window.print()} aria-label="PDF 다운로드">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          PDF 다운로드
        </button>
      </div>

      <style jsx global>{`
        .resume-page {
          /*
            사이트 팔레트에 매핑한다. --accent·--ink 는 선언하지 않고 사이트 :root 값을 상속한다.
            사이트는 단일 다크 테마이므로 화면에서는 이력서도 함께 어두워진다.
            인쇄는 아래 @media print 가 흰 종이 + 먹색으로 덮는다.
          */
          --paper: var(--bg);
          --paper-2: var(--surface);
          --ink-soft: var(--text-muted);
          --ink-faint: var(--text-muted);
          --rule: var(--border);
          --accent-deep: var(--accent-hover);
          --accent-wash: var(--surface);
          --maxw: 940px;
          position: relative;
          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          font-family: var(--font-instrument), ui-sans-serif, -apple-system, sans-serif;
          line-height: 1.55;
          font-size: 15px;
          letter-spacing: 0.005em;
          padding: 0 24px;
        }
        .resume-page::before { display: none; }
        .resume-page *,
        .resume-page *::before,
        .resume-page *::after { box-sizing: border-box; }
        .resume-page .sheet {
          position: relative;
          z-index: 1;
          max-width: var(--maxw);
          margin: 0 auto;
          padding: 40px 0 80px;
        }
        .resume-page .backlink {
          display: inline-block;
          font-family: var(--font-jbmono), monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          color: var(--ink-faint);
          text-decoration: none;
          margin-bottom: 28px;
        }
        .resume-page .backlink:hover { color: var(--accent); }

        .resume-page header { margin-bottom: 44px; }
        .resume-page .eyebrow {
          font-family: var(--font-jbmono), monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
        }
        .resume-page h1 {
          font-family: var(--font-display), ui-sans-serif, -apple-system, sans-serif;
          font-weight: 600;
          font-size: clamp(48px, 8vw, 88px);
          line-height: 0.94;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .resume-page h1 .en {
          display: block;
          font-size: clamp(15px, 2vw, 19px);
          font-style: italic;
          font-weight: 400;
          color: var(--ink-faint);
          letter-spacing: 0.02em;
          margin-top: 10px;
        }
        .resume-page .tagline {
          font-family: var(--font-display), ui-sans-serif, -apple-system, sans-serif;
          font-size: clamp(18px, 2.6vw, 23px);
          line-height: 1.45;
          font-weight: 400;
          color: var(--ink-soft);
          max-width: 38em;
          margin: 22px 0 24px;
        }
        /* 소개 문단은 굵은 강조를 쓰지 않으므로 .tagline b 규칙도 없앴다 (#256). */
        .resume-page .contacts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 22px;
          font-family: var(--font-jbmono), monospace;
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        .resume-page .contacts a {
          color: var(--ink-soft);
          text-decoration: none;
          border-bottom: 1px solid var(--rule);
          padding-bottom: 1px;
        }
        .resume-page .contacts a:hover { color: var(--accent); border-color: var(--accent); }
        .resume-page .contacts span { color: var(--ink-faint); }

        .resume-page .metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          margin: 40px 0 52px;
        }
        .resume-page .metric { background: var(--paper); padding: 20px 18px 18px; }
        .resume-page .metric .big {
          font-family: var(--font-jbmono), monospace;
          /* 전역 IBM Plex Mono 인스턴스가 로드하는 굵기는 400·500·600 이다.
             (변수 이름 --font-jbmono 는 JetBrains Mono 시절 그대로 유지한 것이다)
             자체 인스턴스를 지우면서 700 을 쓰면 합성 볼드로 떨어지므로 600 으로 맞춘다. */
          font-weight: 600;
          font-size: clamp(20px, 3vw, 27px);
          letter-spacing: -0.02em;
          color: var(--accent-deep);
          display: flex;
          align-items: baseline;
          gap: 0.32em;
          flex-wrap: wrap;
          line-height: 1;
        }
        .resume-page .metric .big .from { color: var(--ink-faint); font-weight: 400; font-size: 0.62em; }
        .resume-page .metric .big .arw { color: var(--accent); font-weight: 400; }
        .resume-page .metric .lbl { font-size: 12px; color: var(--ink-soft); margin-top: 10px; line-height: 1.4; }

        .resume-page section {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 0 36px;
          padding: 34px 0;
          border-top: 1px solid var(--rule);
        }
        .resume-page .sec-head { position: relative; }
        .resume-page .sec-num {
          font-family: var(--font-jbmono), monospace;
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.1em;
        }
        .resume-page .sec-title {
          font-family: var(--font-display), ui-sans-serif, -apple-system, sans-serif;
          font-weight: 600;
          font-size: 20px;
          line-height: 1.15;
          margin-top: 8px;
          letter-spacing: -0.01em;
          position: sticky;
          top: 20px;
        }
        .resume-page .sec-body { min-width: 0; }

        .resume-page .skill-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 14px;
          padding: 9px 0;
          border-bottom: 1px dotted var(--rule);
        }
        .resume-page .skill-row:last-child { border-bottom: 0; }
        .resume-page .skill-row .k {
          font-family: var(--font-jbmono), monospace;
          font-size: 11.5px;
          color: var(--accent-deep);
          letter-spacing: 0.02em;
          padding-top: 2px;
        }
        .resume-page .skill-row .v { font-size: 13.5px; color: var(--ink-soft); }
        .resume-page .skill-row .v b { color: var(--ink); font-weight: 600; }

        .resume-page .job { margin-bottom: 6px; }
        .resume-page .job-top { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px 16px; }
        .resume-page .job-org { font-family: var(--font-display), ui-sans-serif, -apple-system, sans-serif; font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
        .resume-page .job-when { font-family: var(--font-jbmono), monospace; font-size: 11.5px; color: var(--ink-faint); white-space: nowrap; }
        .resume-page .job-role { font-size: 13.5px; color: var(--accent-deep); margin-top: 3px; font-weight: 500; }
        /* .job-note 는 job-role 과 같은 말을 되풀이하던 줄이라 없앴다 (#256). */

        .resume-page .proj { margin-top: 22px; }
        .resume-page .proj:first-of-type { margin-top: 20px; }
        .resume-page .proj-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 3px;
          flex-wrap: wrap;
        }
        .resume-page .proj-name .star { color: var(--accent); font-size: 12px; }
        .resume-page .pwhen { color: var(--ink-faint); font-weight: 400; font-size: 12px; }
        /*
          .faint 는 항목 끝의 (2024)·(2026) 꼬리표에만 쓰였다. 그 꼬리표를 항목 앞의 .yr 로
          옮기면서 쓰는 곳이 없어져 규칙을 지웠다 (#256).
        */
        .resume-page .proj-desc { font-size: 13px; color: var(--ink-faint); margin-bottom: 9px; line-height: 1.5; }
        .resume-page ul { list-style: none; }
        .resume-page li {
          position: relative;
          padding-left: 18px;
          margin: 6px 0;
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.6;
        }
        .resume-page li::before {
          content: "";
          position: absolute;
          left: 2px;
          top: 0.62em;
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 1px;
        }
        .resume-page li b { color: var(--ink); font-weight: 600; }
        /*
          항목의 연도. 강조색을 쓰지 않는다 — 화면 강조색은 라임이고 li::before 의 사각형이
          이미 라임이라, 연도까지 라임으로 두면 한 줄에 라임이 둘씩 생긴다 (#152 의 "강조색은
          아껴 쓴다"와도 어긋난다). 대신 job-when·pwhen·edu-meta 와 같은 메타 정보 색을 쓰고,
          min-width 로 연도를 세로로 맞춰 훑을 수 있게 한다. 눈에 걸리는 것은 색이 아니라 정렬이다.
          인쇄 시 이 색은 #6f6b62 로 흰 종이 대비 5.31:1 이다 (#225 에서 AA 위로 올린 값).
        */
        .resume-page li .yr {
          font-family: var(--font-jbmono), monospace;
          font-size: 0.84em;
          font-weight: 500;
          color: var(--ink-faint);
          letter-spacing: 0.02em;
          display: inline-block;
          min-width: 2.9em;
          margin-right: 0.35em;
        }
        .resume-page .kbd {
          font-family: var(--font-jbmono), monospace;
          font-size: 0.86em;
          background: var(--accent-wash);
          color: var(--accent-deep);
          padding: 0.05em 0.4em;
          border-radius: 3px;
          font-weight: 500;
          white-space: nowrap;
        }

        .resume-page .edu-item { margin-bottom: 16px; }
        .resume-page .edu-item:last-child { margin-bottom: 0; }
        .resume-page .edu-name { font-weight: 600; font-size: 14px; }
        .resume-page .edu-meta { font-family: var(--font-jbmono), monospace; font-size: 11.5px; color: var(--ink-faint); margin-top: 2px; }
        .resume-page .edu-desc { font-size: 13px; color: var(--ink-soft); margin-top: 4px; }

        .resume-page footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--rule);
          font-family: var(--font-jbmono), monospace;
          font-size: 11px;
          color: var(--ink-faint);
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .resume-page .dl {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 20;
          font-family: var(--font-jbmono), monospace;
          font-size: 12.5px;
          font-weight: 500;
          background: var(--ink);
          color: var(--paper);
          border: none;
          padding: 13px 20px;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 9px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
          transition: transform 0.18s, background 0.18s;
        }
        .resume-page .dl:hover { transform: translateY(-2px); background: var(--accent-deep); }
        .resume-page .dl svg { width: 15px; height: 15px; }

        @keyframes resumeRise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        .resume-page header,
        .resume-page .metrics,
        .resume-page section,
        .resume-page footer { animation: resumeRise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
        .resume-page .metrics { animation-delay: 0.08s; }
        /* 섹션이 3개에서 4개로 늘었다 — 4번째를 빠뜨리면 지연 없이 먼저 올라온다 (#256). */
        .resume-page section:nth-of-type(1) { animation-delay: 0.14s; }
        .resume-page section:nth-of-type(2) { animation-delay: 0.2s; }
        .resume-page section:nth-of-type(3) { animation-delay: 0.26s; }
        .resume-page section:nth-of-type(4) { animation-delay: 0.32s; }
        .resume-page footer { animation-delay: 0.38s; }
        @media (prefers-reduced-motion: reduce) {
          .resume-page * { animation: none !important; }
        }

        @media (max-width: 720px) {
          .resume-page { font-size: 14.5px; padding: 0 18px; }
          .resume-page .sheet { padding: 30px 0 90px; }
          .resume-page .metrics { grid-template-columns: repeat(2, 1fr); }
          .resume-page section { grid-template-columns: 1fr; gap: 14px; padding: 28px 0; }
          .resume-page .sec-head { display: flex; align-items: baseline; gap: 12px; }
          .resume-page .sec-title { position: static; margin-top: 0; }
          .resume-page .skill-row { grid-template-columns: 1fr; gap: 2px; }
        }

        @media print {
          @page { size: A4; margin: 14mm 13mm; }
          html, body { background: #fff; }
          /*
            화면이 어두워도 인쇄는 항상 흰 종이 + 먹색으로 고정한다.
            강조색도 먹색 계열로 덮는다 — 사이트 강조색인 라임(#d8f26a)은 흰 종이에서 읽히지 않는다.
          */
          .resume-page {
            --paper: #ffffff;
            --paper-2: #f7f6f3;
            --ink: #1c1b18;
            --ink-soft: #4a4740;
            /*
              #8a857a 는 흰 종이 대비 3.67:1 로 AA(4.5:1)에 못 미쳤다 (#225).
              이 색이 쓰이는 23곳은 근무 기간·프로젝트 설명·학력 연도처럼 읽어야 하는
              정보이고, 8~12px 로 작기까지 하다. 5.31:1 로 올린다.
              --ink-soft 와의 단계 차는 2.52 → 1.75:1 로 좁아지지만 세 단계는 유지된다.
            */
            --ink-faint: #6f6b62;
            --rule: #e2e0db;
            --accent: #1c1b18;
            --accent-deep: #000000;
            --accent-wash: #f2f1ee;
          }
          .resume-page {
            padding: 0;
            font-size: 10.2px;
            line-height: 1.36;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #fff;
          }
          .resume-page::before { display: none; }
          .resume-page .backlink { display: none; }
          .resume-page .dl { display: none; }
          .resume-page .sheet { max-width: none; padding: 0; animation: none; }
          .resume-page * { animation: none !important; }
          /*
            아래 여백 값들은 A4 두 쪽에 맞추려고 조인 것이다 (#226).
            세 쪽이 나오면서 마지막 쪽이 27%만 차 종이 한 장이 거의 비었다.

            글자 크기는 건드리지 않는다 — 이미 10.2px 이라 더 줄이면 읽기 어려워진다.
            대신 반복되는 선언(li 26개 · proj 9개 · skill-row 7개)의 여백을 줄인다.
            한 곳을 1px 줄이면 개수만큼 곱해져 돌아온다.
          */
          .resume-page header { margin-bottom: 8px; }
          .resume-page h1 { font-size: 30px; }
          .resume-page h1 .en { font-size: 12px; margin-top: 4px; }
          .resume-page .tagline { font-size: 12px; margin: 6px 0 6px; max-width: none; }
          .resume-page .contacts { font-size: 9.5px; gap: 4px 16px; }
          /*
            성과 격자는 3칸이다. 그런데 @media (max-width: 720px) 가 2칸으로 접는데,
            A4 인쇄 폭이 184mm ≒ 695px 이라 인쇄에서도 그 규칙이 걸린다.
            지표가 3개라 2칸에서는 넷째 칸이 빈 회색 상자로 남는다 — 인쇄본에서 실수처럼 보인다.
            폭 조건이 아니라 매체 조건으로 다시 3칸을 지정한다. 덤으로 한 줄이 줄어 높이도 준다.
          */
          .resume-page .metrics { margin: 4px 0 6px; grid-template-columns: repeat(3, 1fr); }
          .resume-page .metric { padding: 5px 12px; }
          .resume-page .metric .big { font-size: 16px; }
          .resume-page .metric .lbl { font-size: 9px; margin-top: 4px; }
          /*
            section 의 break-inside: avoid 는 뗀다. 경력 섹션은 1100px 이 넘어 한 쪽에
            들어갈 수 없고, 들어갈 수 없는 블록의 avoid 는 지켜지지 않는다.
            지켜야 할 것은 프로젝트 하나가 쪽 사이에서 잘리지 않는 것이고 그건 .proj 가 맡는다.
          */
          .resume-page section { padding: 3px 0; grid-template-columns: 130px 1fr; gap: 0 26px; }
          .resume-page .sec-title { font-size: 15px; position: static; }
          .resume-page .job-org { font-size: 16px; }
          .resume-page .proj { margin-top: 4px; break-inside: avoid; }
          .resume-page .proj-name { font-size: 12px; }
          .resume-page .proj-desc { font-size: 10px; margin-bottom: 2px; }
          .resume-page li { font-size: 10px; margin: 1px 0; line-height: 1.38; }
          .resume-page li::before { top: 0.5em; }
          .resume-page .skill-row { padding: 1px 0; }
          .resume-page footer { margin-top: 10px; font-size: 8.5px; }
          .resume-page a { color: var(--ink) !important; border: none !important; }
        }
      `}</style>
    </>
  )
}
