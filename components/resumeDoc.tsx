"use client"

import Link from "next/link"
import { Instrument_Sans } from "next/font/google"

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
 */
export default function ResumeDoc() {
  return (
    <>

      <div className={`resume-page ${instrument.variable}`}>
        <div className="sheet">
          <Link href="/" className="backlink">← Portfolio</Link>

          <header>
            <div className="eyebrow">Backend Engineer · Fullstack</div>
            <h1>
              오세준<span className="en">Sejune Oh — 백엔드 개발자 · 풀스택</span>
            </h1>
            {/*
              담백하게 둔다 — 굵은 강조도 수치도 쓰지 않는다 (#256).
              역할·경력 연수는 위 아이브로우·이름 아래 줄·아래 연락처 줄이 이미 말하고 있어서,
              여기서 되풀이하면 세 번 같은 말을 하게 된다.
            */}
            <p className="tagline">
              C#/.NET으로 서버를 만듭니다. 지금은 병원 도메인 SaaS의 메시징 백엔드를 맡고 있습니다.
              맡은 기능은 설계부터 운영까지 직접 봅니다.
            </p>
            <div className="contacts">
              <a href="mailto:etry0715@gmail.com">etry0715@gmail.com</a>
              <a href="https://github.com/SejuneOh" target="_blank" rel="noopener noreferrer">
                github.com/SejuneOh
              </a>
              <span>경력 7년 6개월</span>
            </div>
          </header>

          <div className="metrics" aria-label="핵심 성과 지표">
            <div className="metric">
              <div className="big">
                <span className="from">91s</span>
                <span className="arw">→</span>0.04s
              </div>
              <div className="lbl">
                병원 목록 API 응답<br />쿼리 최적화 (#11165)
              </div>
            </div>
            <div className="metric">
              <div className="big">
                −97<span className="from" style={{ fontSize: ".5em" }}>%</span>
              </div>
              <div className="lbl">
                메시지 조회 지연<br />147ms → 4ms
              </div>
            </div>
            <div className="metric">
              <div className="big">
                782<span className="from">/782</span>
              </div>
              <div className="lbl">
                데이터 마이그레이션<br />무결성 검증 통과
              </div>
            </div>
          </div>

          {/* 핵심 역량 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">01</div>
              <h2 className="sec-title">핵심 역량</h2>
            </div>
            <div className="sec-body">
              {/*
                굵은 쪽이 주로 쓰는 것, 뒤가 함께 쓰는 것이다.
                'AI 연동' 행은 따로 두지 않는다 — Semantic Kernel 은 .NET 라이브러리라
                Backend 에서 쓰는 것이고, 행을 쪼개면 한 줄에 항목 두 개짜리 행이 생긴다 (#256).
              */}
              <div className="skill-row"><div className="k">Backend</div><div className="v"><b>C#, ASP.NET Core, .NET 10, EF Core</b> · MassTransit + RabbitMQ, SignalR, Hangfire, Refit, Polly, Semantic Kernel(Azure OpenAI)</div></div>
              <div className="skill-row"><div className="k">Architecture</div><div className="v"><b>DDD, CQRS(MediatR), 이벤트 기반</b> · Clean Architecture, 멀티테넌시</div></div>
              <div className="skill-row"><div className="k">Data</div><div className="v"><b>Azure SQL / MS SQL Server, Cosmos DB, Redis</b> · Azure Cognitive Search, EF Core 멀티 스키마 마이그레이션</div></div>
              <div className="skill-row"><div className="k">인증 · 연동</div><div className="v"><b>IdentityServer(OIDC/OAuth2/CIBA)</b> · WhatsApp·Meta Graph, LINE, WeChat, Vonage(SMS OTP)</div></div>
              <div className="skill-row"><div className="k">Cloud · DevOps</div><div className="v"><b>Azure Container Apps, .NET Aspire</b> · Bicep(IaC), GitHub Actions CI/CD, App Insights</div></div>
              <div className="skill-row"><div className="k">Frontend</div><div className="v"><b>React, TypeScript, Next.js</b> · SWR, React-Hook-Form, Vue</div></div>
            </div>
          </section>

          {/* 경력 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">02</div>
              <h2 className="sec-title">경력</h2>
            </div>
            <div className="sec-body">
              <div className="job">
                <div className="job-top">
                  <div className="job-org">클라우드호스피탈</div>
                  <div className="job-when">2023.02 – 재직중 · 정규직</div>
                </div>
                {/*
                  job-role 과 job-note 가 같은 말(입사 → 백엔드 전환)을 두 번 하고 있었다.
                  한 줄로 합치고 job-note 는 없앴다 (#256).
                */}
                <div className="job-role">
                  병원 도메인 SaaS · 백엔드 중심 풀스택 (2023 React 프론트엔드로 입사 → 2024 백엔드 전환)
                </div>
              </div>

              {/*
                메시징 이야기가 세 블록(오너십 / WhatsApp 통합 / 속도 최적화)으로 흩어져 있었다.
                기간이 겹쳐 순서를 따라 읽을 수 없었고, 하나의 소유권이 작은 일 셋으로 보였다.
                연도 순서가 드러나는 한 블록으로 합쳤다 (#256).
              */}
              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 멀티플랫폼 메시징 플랫폼 설계·소유{" "}
                  <span className="pwhen">· 2024.09~현재</span>
                </div>
                <div className="proj-desc">
                  상담 채팅 백엔드를 이벤트 엔진 구축부터 독립 서비스 분리까지 소유. 프로덕션에서 8개 병원 테넌트가 쓴다.
                </div>
                <ul>
                  <li><span className="yr">2024</span> 실시간 채팅 이벤트 엔진(CloudHospital.MessageBroker)을 단독 구축하고 WhatsApp Chat API를 통합 — SignalR로 상담원 입·퇴장·메시지·핸드오프 이벤트를 처리하고, 세션 CRUD·웹훅·<b>상담원 이관</b>까지 동작</li>
                  <li><span className="yr">2025</span> 메인 API의 채팅 서브시스템을 <b>단독 소유</b>(연 153 PR) — 플랫폼에 종속되지 않는 ChatSession 도메인 모델(활성·만료 분리), 중복 세션 방지, 교차병원 세션 관리, Cosmos DB 쿼리를 클라이언트측에서 서버측으로 이전</li>
                  <li><span className="yr">2025</span> 메시지 모달리티 3종(미디어·템플릿·설문 플로우)과 24시간 세션 윈도우를 구현하고 Meta Graph API로 재플랫폼 — <b>Redis 세션 캐시 계층</b> 도입(생성 실패 시 재초기화), 미응답·미배정 상담원 알림(SignalR·이메일)을 테넌트 단위 라우팅으로 재구축</li>
                  <li><span className="yr">2026</span> 채팅 백엔드를 독립 서비스 <b>Omni</b>로 재플랫폼 — .NET 10, DDD/CQRS(MediatR), MassTransit + RabbitMQ 이벤트 기반, EF Core 10 멀티 스키마, WhatsApp·LINE·WeChat 통합(Refit·HMAC-SHA256 웹훅)</li>
                  <li><span className="yr">2026</span> MediatR·MassTransit 필터로 3계층 계측을 깔아 병목을 분리 — 메시지 조회 <span className="kbd">194 → 3ms</span>, 매니저 조회 <span className="kbd">147 → 4ms</span>. 남은 자동번역 지연의 80%는 외부 RAG API임을 규명</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 병원 도메인 API 성능·안정화{" "}
                  <span className="pwhen">· 2024, 2026</span>
                </div>
                <ul>
                  <li><span className="yr">2024</span> 의사·병원 도메인 API와 Azure Cognitive Search 문서모델을 동기화하고, Doctors V3 응답 페이로드에서 약 <b>1,800줄</b>을 제거</li>
                  <li><span className="yr">2026</span> 병원 목록 API의 카테시안 폭발(단일 쿼리 1.38억 row)을 찾아 EF Core ProjectTo + AsSplitQuery 로 분리 — <span className="kbd">91초 → 0.04초</span>, 180초에 타임아웃 나던 v2는 0.26초</li>
                  {/*
                    이 둘은 연도를 모른다 — 원본에도 (2024)·(2026) 표시가 없었고 지어내지 않는다.
                    빈 .yr 로 자리만 맞춘다. 없으면 같은 목록 안에서 본문 시작 위치가 두 갈래로
                    갈려 왼쪽 선이 들쭉날쭉해진다.
                  */}
                  <li><span className="yr" aria-hidden="true" />Polly 재시도·타임아웃 정책을 3개 프로젝트에 도입해 외부 호출 장애 <b>333건</b>을 흡수, Azure AD 토큰 발급을 요청당 <span className="kbd">N회 → 1회</span>로 캐싱</li>
                  <li><span className="yr" aria-hidden="true" />Hangfire 작업을 In-Memory에서 SQL Server로 영속화하고, 클라이언트 이탈 오탐을 고쳐 오류 리포트 <b>1,959건</b>을 없앰</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 인증: CIBA · 게스트 액세스{" "}
                  <span className="pwhen">· 2024~2025</span>
                </div>
                <ul>
                  <li>SMS 기반 <b>CIBA</b>(Client-Initiated Backend Authentication) 로그인 구현 — Vonage OTP 연동, 레거시 STS API를 신규 Identity Admin API로 이전(IdentityServer)</li>
                  <li>비로그인 게스트 채팅 API 설계 — OAuth client-credentials, 401·405를 타입으로 명시한 OpenAPI 오류 계약, 유저 수정·삭제 시 강제 로그아웃</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> AI 번역 신뢰성 · EhrApi 이벤트 파이프라인{" "}
                  <span className="pwhen">· 2026</span>
                </div>
                <ul>
                  <li>희귀 언어 의료 용어의 번역 실패 원인을 4단계로 규명 → Semantic Kernel 전사를 <b>GPT-4.x에서 GPT-5.4로 이전</b>, 토큰 상한으로 무한 반복을 차단</li>
                  <li>신규 구축에 참여한 EhrApi(.NET 10 · FHIR)에 MassTransit 이벤트 발행 파이프라인(CQRS 핸들러 5개)과 HIPAA 감사 로그 커밋 순서 제어를 구현 — <b>테스트 999개 전량 통과</b></li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  React Admin 프론트엔드 <span className="pwhen">· 2023.02~2024 초</span>
                </div>
                <ul>
                  <li>Admin 페이지를 Redux에서 <b>SWR 커스텀 훅</b>으로 이전하고, Formik을 React-Hook-Form으로 전환</li>
                  <li>백엔드 전환 이후에도 SaaS 랜딩 기능·인도 지역 언어 i18n·Redis/ISR 캐싱 등 프론트엔드를 병행</li>
                </ul>
              </div>

              <div className="job" style={{ marginTop: 34 }}>
                <div className="job-top">
                  <div className="job-org">인지소프트</div>
                  <div className="job-when">2017.12 – 2021.07 · 정규직</div>
                </div>
                <div className="job-role">금융권 이미지 솔루션 SI · 개발/유지보수 (C#/.NET, Java)</div>
              </div>
              <div className="proj" style={{ marginTop: 14 }}>
                <div className="proj-desc">
                  은행·카드·증권 고객사에 문서 인식·전자문서·이미지 보안 솔루션을 납품하는 SI 업체.
                </div>
                <ul>
                  <li><b>현대카드</b> 법원문서 인식 서버 연동 모듈 — VB6/Java로 JSON API 통신 모듈 개발, 인식 영역 처리로 단어 인식률 개선</li>
                  <li><b>대구은행</b> 디지털 창구 전자문서 — C# 창구 클라이언트 유지보수, PDF 서식 개발</li>
                  <li>이미지 암·복호화 솔루션의 C#/Java 마이그레이션 및 사용자 웹페이지 개발</li>
                  <li>신한은행·수협·대신증권 등 다수 고객사의 C#(WinForm/.NET) 프로그램 유지보수</li>
                </ul>
              </div>

            </div>
          </section>

          {/*
            사이드 프로젝트는 경력 안에서 회사 블록(.job + .job-org)을 재사용해 그려지고 있었다.
            근무 기간이 없는 회사처럼 보이고 실무 경력과 섞였다. 자체 섹션으로 분리했다 (#256).
          */}
          <section>
            <div className="sec-head">
              <div className="sec-num">03</div>
              <h2 className="sec-title">사이드 프로젝트</h2>
            </div>
            <div className="sec-body">
              <ul>
                <li><b>농구 게스트 호스팅 서비스</b> — React/TS + Nest.js, MongoDB, Kakao Map 연동 SPA (REST API·인증·게시글 CRUD)</li>
                <li><b>꾸다 렌탈 기업연계 결제/백오피스</b> — Node.js/Express/MongoDB, JWT 로그인, Multipart 이미지 업로드, Git-flow 도입</li>
                <li><b>NYTimes 검색 웹</b> — Redux-Toolkit, LocalStorage 검색 기록, Styled-Components</li>
              </ul>
            </div>
          </section>

          {/* 학력 / 교육 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">04</div>
              <h2 className="sec-title">학력 · 교육</h2>
            </div>
            <div className="sec-body">
              <div className="edu-item">
                <div className="edu-name">백석문화대학교 · 스마트폰 컨텐츠학과</div>
                <div className="edu-meta">2012.03 – 2016.12</div>
              </div>
              <div className="edu-item">
                <div className="edu-name">FastCampus 프론트엔드 개발자 양성 4기</div>
                <div className="edu-meta">2022.04 – 2022.07</div>
                <div className="edu-desc">HTML/CSS/JS, React, Next.js</div>
              </div>
              <div className="edu-item">
                <div className="edu-name">삼성 멀티캠퍼스 Java Web 개발자 양성 부트캠프</div>
                <div className="edu-meta">2016.03 – 2016.09</div>
                <div className="edu-desc">Java, MSSQL, Spring</div>
              </div>
            </div>
          </section>

          <footer>
            <span>오세준 · Sejune Oh</span>
            <span>Updated 2026.08 · Backend / Fullstack</span>
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
