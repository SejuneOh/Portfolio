import Head from "next/head"
import Link from "next/link"

/**
 * 정식 이력서 페이지 (/resume)
 * 홈/블로그가 "개성 있는 에디토리얼"이라면, 이 페이지는 정규화된 공식 문서다.
 * - 사이트 매거진 레이아웃(사이드바)을 쓰지 않는 독립 문서
 * - 사이트 테마(다크)와 무관하게 항상 페이퍼 톤 유지 (인쇄물 성격)
 * - PDF 다운로드 = 브라우저 인쇄(A4 최적화 print CSS)
 */
export default function Resume() {
  return (
    <>
      <Head>
        <title>오세준 — 이력서 · 백엔드 개발자</title>
        <meta name="description" content="오세준(Sejune Oh) — C#/.NET 백엔드 개발자 정식 이력서" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="resume-page">
        <div className="sheet">
          <Link href="/" className="backlink">← Portfolio</Link>

          <header>
            <div className="eyebrow">Backend Engineer · Fullstack</div>
            <h1>
              오세준<span className="en">Sejune Oh — 백엔드 개발자 · 풀스택</span>
            </h1>
            <p className="tagline">
              약 7년간 C#/.NET을 다뤄온 개발자입니다. 금융권 이미지 솔루션 SI를 거쳐, 병원 도메인 SaaS에서{" "}
              <b>최근 2년 이상 멀티플랫폼 채팅/메시징 백엔드를 설계·소유</b>해 왔습니다. React 프론트엔드까지 직접 개발해,
              기능을 <b>설계부터 배포·운영까지 끝까지 책임집니다.</b>
            </p>
            <div className="contacts">
              <a href="tel:+821027911866">+82 10-2791-1866</a>
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
            <div className="metric">
              <div className="big">
                8<span className="from" style={{ fontSize: ".5em" }}> tenants</span>
              </div>
              <div className="lbl">
                프로덕션 병원<br />서비스 운영
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
              <div className="skill-row"><div className="k">Backend</div><div className="v"><b>C#, ASP.NET Core, .NET 10, EF Core</b>, MassTransit + RabbitMQ, SignalR, Hangfire, Refit, Polly, AutoMapper</div></div>
              <div className="skill-row"><div className="k">Architecture</div><div className="v"><b>DDD, Clean Architecture, CQRS</b>(MediatR), 이벤트 기반, 멀티테넌시</div></div>
              <div className="skill-row"><div className="k">Database</div><div className="v"><b>Azure SQL / MS SQL Server</b>, Cosmos DB, Redis, Azure Cognitive Search, EF Core 마이그레이션(멀티 스키마)</div></div>
              <div className="skill-row"><div className="k">인증 / 연동</div><div className="v"><b>IdentityServer(OIDC/OAuth2/CIBA)</b>, WhatsApp·Meta Graph API, LINE·WeChat API, Vonage(SMS OTP)</div></div>
              <div className="skill-row"><div className="k">Cloud / DevOps</div><div className="v"><b>Azure Container Apps, .NET Aspire</b>, Bicep(IaC), GitHub Actions CI/CD, OIDC, App Insights</div></div>
              <div className="skill-row"><div className="k">Frontend</div><div className="v"><b>React, TypeScript, Next.js</b>, SWR, React-Hook-Form, Vue</div></div>
              <div className="skill-row"><div className="k">AI 연동</div><div className="v">Azure OpenAI / Semantic Kernel, 번역 파이프라인, RAG 연동</div></div>
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
                <div className="job-role">
                  React 프론트엔드로 입사(2023) → 2024년 백엔드 전환 · 현재 백엔드 중심 풀스택 (병원 도메인 SaaS)
                </div>
                <div className="job-note">
                  2023년 React Admin 프론트엔드 담당 → 2024년 백엔드 전환, 이후 이 플랫폼의 채팅/메시징 백엔드를 2년 이상
                  주도적으로 설계·소유하며 프론트엔드를 병행.
                </div>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 실시간 채팅/메시징 백엔드 설계·오너십{" "}
                  <span className="pwhen">· 2024.09~현재</span>
                </div>
                <div className="proj-desc">SaaS의 멀티플랫폼 고객 상담 채팅 백엔드를 착수부터 독립 플랫폼화까지 주도.</div>
                <ul>
                  <li><b>2024</b>: 실시간 채팅 이벤트 엔진(CloudHospital.MessageBroker) 단독 구축 — <span className="kbd">SignalR</span> 상담원 입장/퇴장·메시지·핸드오프 이벤트 처리 → <b>WhatsApp Chat API 통합</b>(그룹 Join/Leave·전송, 세션 CRUD, 웹훅, 상담원 이관)</li>
                  <li><b>2025</b>: 메인 API 채팅 서브시스템 <b>단독 소유</b>(연 153 PR 대부분) — ChatSession 도메인 모델(활성/만료 분리·플랫폼 비종속), GetChatSessions <span className="kbd">CQRS</span> 쿼리/정렬 반복 최적화, 중복 세션 방지, 교차병원 세션 관리, <b>Cosmos DB 클라이언트측→서버측 쿼리 마이그레이션</b></li>
                  <li><b>2026</b>: 위 채팅 백엔드를 독립 서비스 <b>Omni</b>로 재플랫폼 — <b>.NET 10 · DDD/CQRS(MediatR)</b>, <span className="kbd">MassTransit + RabbitMQ</span> 이벤트 기반, EF Core 10 멀티 스키마, WhatsApp·LINE·WeChat 통합(<span className="kbd">Refit</span>·HMAC-SHA256 웹훅)</li>
                  <li><b>프로덕션 운영 · 8개 병원 테넌트</b> 서비스 적용</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> WhatsApp/Meta 메시징 통합 &amp; 메시징 인프라{" "}
                  <span className="pwhen">· 2025</span>
                </div>
                <ul>
                  <li>미디어(이미지/음성/영상)·<b>템플릿</b>·플로우(설문) <b>3종 메시지 모달리티</b> 구현, <b>24시간 세션 윈도우</b> 관리, 하반기 <b>Meta Graph API 재플랫폼</b></li>
                  <li><b>Redis 세션 상태/캐시 계층 도입</b>, 세션 생성 실패 시 Redis 재초기화(복원력), 환경별 캐시 리셋</li>
                  <li><b>SignalR + 이메일 알림 시스템 재구축</b> — 미응답/미배정 상담원 알림, 핸드오프 BCC, 내부/외부 수신자 분리, 테넌트ID 기반 라우팅</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 메시지 전송 속도 최적화{" "}
                  <span className="pwhen">· 2026.05</span>
                </div>
                <ul>
                  <li>MediatR 파이프라인 + MassTransit 커스텀 필터 + Stopwatch로 <b>3계층 계측</b> 구축, Redis 캐싱·경량 EF Include·이벤트 페이로드 인라인화 적용</li>
                  <li>메시지 fetch <span className="kbd">194→3ms</span>, 매니저 조회 <span className="kbd">147→4ms (−97%)</span>, 자동번역 병목의 <b>80%가 외부 RAG API</b>임을 규명</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 인증 시스템: CIBA · 게스트 액세스{" "}
                  <span className="pwhen">· 2024~2025</span>
                </div>
                <ul>
                  <li><b>SMS 기반 CIBA</b>(Client-Initiated Backend Authentication) 로그인 구현 — Vonage OTP 연동, 레거시 STS API를 신규 Identity Admin API로 마이그레이션 (IdentityServer)</li>
                  <li><b>게스트/비로그인 채팅 API</b> 설계 — OAuth client-credentials, 타입드 401/405 OpenAPI 오류 계약, 유저 수정/삭제 시 강제 로그아웃</li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> 병원 도메인 API · 대용량 성능 최적화 &amp; 안정화{" "}
                  <span className="pwhen">· 2024, 2026</span>
                </div>
                <ul>
                  <li><b>의사/병원 도메인 API + Azure Cognitive Search</b> 문서모델 동기화, Doctors V3 응답 페이로드 최적화(약 1,800줄 제거) <span className="faint">(2024)</span></li>
                  <li><b>병원 목록 API 쿼리 최적화</b>: EF Core <span className="kbd">ProjectTo + AsSplitQuery</span>로 카테시안 폭발(단일 쿼리 <b>1.38억 row</b>) 해소 → <b>91초 → 0.04초</b>, v2 180초 타임아웃 → 0.26초 <span className="faint">(2026)</span></li>
                  <li><b>HTTP 복원력 계층</b>: Polly 재시도·타임아웃 정책 3개 프로젝트 도입, <b>333건</b> 장애 대응, Azure AD 토큰 캐싱 <span className="kbd">N회 → 1회</span></li>
                  <li><b>Hangfire 영속화</b>(In-Memory→SQL Server), 클라이언트 이탈 오탐 수정으로 오류 리포트 <b>1,959건 제거</b></li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  <span className="star">◆</span> AI 번역 신뢰성 개선 · EhrApi 이벤트 기반 백엔드{" "}
                  <span className="pwhen">· 2026</span>
                </div>
                <ul>
                  <li><b>AI 번역</b>: 희귀 언어 의료 용어 번역 실패의 4단계 근본 원인 규명 → <b>GPT-4.x→GPT-5.4 전사 마이그레이션</b>(Semantic Kernel), 토큰 상한으로 무한 반복 방지</li>
                  <li><b>EhrApi</b>(신규 구축 참여): .NET 10·FHIR EHR에 MassTransit 통합 이벤트 발행 파이프라인(5개 CQRS 핸들러), HIPAA 감사 로그 커밋 순서 제어 — <b>테스트 999개 전량 통과</b></li>
                </ul>
              </div>

              <div className="proj">
                <div className="proj-name">
                  React Admin 프론트엔드 <span className="pwhen">· 2023.02~2024 초</span>
                </div>
                <ul>
                  <li>Admin 페이지 <b>SWR 커스텀 훅 마이그레이션</b>(Redux→SWR 경량화), 다수 페이지 마이그레이션, Formik→React-Hook-Form 전환</li>
                  <li>이후 SaaS 랜딩 기능·인도 지역 언어 i18n·Redis/ISR 캐싱 등 프론트엔드 병행</li>
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
                  금융권 고객사(은행·카드·증권)에 문서 인식·전자문서·이미지 보안 솔루션을 납품하는 SI 업체에서
                  솔루션 개발·유지보수를 담당.
                </div>
                <ul>
                  <li><b>현대카드 법원문서 인식 서버 연동 모듈</b>: VB6/Java로 인식 서버와 JSON API 통신 모듈 개발, 특정 인식 영역 처리로 단어 인식률 개선</li>
                  <li><b>대구은행 디지털 창구 전자문서 서식 프로젝트</b>: C# 창구 클라이언트 유지보수 및 PDF 서식 개발</li>
                  <li><b>이미지 암·복호화 마이그레이션</b>: C#/Java 솔루션 마이그레이션 및 사용자 웹페이지 개발</li>
                  <li><b>금융권 솔루션 유지보수</b>: 신한은행·수협·대신증권 등 다수 고객사 C#(WinForm/.NET) 프로그램 유지보수 및 이슈 관리</li>
                </ul>
              </div>

              <div className="job" style={{ marginTop: 30 }}>
                <div className="job-top">
                  <div className="job-org" style={{ fontSize: 17 }}>사이드 / 부트캠프 프로젝트</div>
                </div>
              </div>
              <div className="proj" style={{ marginTop: 12 }}>
                <ul>
                  <li><b>농구 게스트 호스팅 서비스</b> — React/TS + Nest.js, MongoDB, Kakao Map 연동 SPA (REST API·인증·게시글 CRUD)</li>
                  <li><b>꾸다 렌탈 기업연계 결제/백오피스</b> — Node.js/Express/MongoDB, JWT 로그인, Multipart 이미지 업로드, Git-flow 도입</li>
                  <li><b>NYTimes 검색 웹</b> — Redux-Toolkit, LocalStorage 검색기록, Styled-Components</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 학력 / 교육 */}
          <section>
            <div className="sec-head">
              <div className="sec-num">03</div>
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
            <span>Updated 2026.07 · Backend / Fullstack</span>
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
          --paper: #f7f4ec;
          --paper-2: #efeadd;
          --ink: #1c1b18;
          --ink-soft: #4a4740;
          --ink-faint: #8a857a;
          --rule: #d8d2c4;
          --accent: #0d6e63;
          --accent-deep: #0a544c;
          --accent-wash: #e3ede9;
          --maxw: 940px;
          position: relative;
          min-height: 100vh;
          background: var(--paper);
          color: var(--ink);
          font-family: "Instrument Sans", -apple-system, sans-serif;
          line-height: 1.55;
          font-size: 15px;
          letter-spacing: 0.005em;
          padding: 0 24px;
        }
        .resume-page::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 15% 10%, rgba(13, 110, 99, 0.04), transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(13, 110, 99, 0.03), transparent 45%);
        }
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
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          color: var(--ink-faint);
          text-decoration: none;
          margin-bottom: 28px;
        }
        .resume-page .backlink:hover { color: var(--accent); }

        .resume-page header { margin-bottom: 44px; }
        .resume-page .eyebrow {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
        }
        .resume-page h1 {
          font-family: "Fraunces", serif;
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
          font-family: "Fraunces", serif;
          font-size: clamp(18px, 2.6vw, 23px);
          line-height: 1.45;
          font-weight: 400;
          color: var(--ink-soft);
          max-width: 38em;
          margin: 22px 0 24px;
        }
        .resume-page .tagline b { color: var(--ink); font-weight: 600; }
        .resume-page .contacts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 22px;
          font-family: "JetBrains Mono", monospace;
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
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          margin: 40px 0 52px;
        }
        .resume-page .metric { background: var(--paper); padding: 20px 18px 18px; }
        .resume-page .metric .big {
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
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
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.1em;
        }
        .resume-page .sec-title {
          font-family: "Fraunces", serif;
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
          font-family: "JetBrains Mono", monospace;
          font-size: 11.5px;
          color: var(--accent-deep);
          letter-spacing: 0.02em;
          padding-top: 2px;
        }
        .resume-page .skill-row .v { font-size: 13.5px; color: var(--ink-soft); }
        .resume-page .skill-row .v b { color: var(--ink); font-weight: 600; }

        .resume-page .job { margin-bottom: 6px; }
        .resume-page .job-top { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px 16px; }
        .resume-page .job-org { font-family: "Fraunces", serif; font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
        .resume-page .job-when { font-family: "JetBrains Mono", monospace; font-size: 11.5px; color: var(--ink-faint); white-space: nowrap; }
        .resume-page .job-role { font-size: 13.5px; color: var(--accent-deep); margin-top: 3px; font-weight: 500; }
        .resume-page .job-note { font-size: 13px; color: var(--ink-soft); margin-top: 8px; font-style: italic; line-height: 1.5; }

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
        .resume-page .faint { color: var(--ink-faint); }
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
        .resume-page .kbd {
          font-family: "JetBrains Mono", monospace;
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
        .resume-page .edu-meta { font-family: "JetBrains Mono", monospace; font-size: 11.5px; color: var(--ink-faint); margin-top: 2px; }
        .resume-page .edu-desc { font-size: 13px; color: var(--ink-soft); margin-top: 4px; }

        .resume-page footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--rule);
          font-family: "JetBrains Mono", monospace;
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
          font-family: "JetBrains Mono", monospace;
          font-size: 12.5px;
          font-weight: 500;
          background: var(--ink);
          color: var(--paper);
          border: none;
          padding: 13px 20px;
          border-radius: 100px;
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
        .resume-page section:nth-of-type(1) { animation-delay: 0.14s; }
        .resume-page section:nth-of-type(2) { animation-delay: 0.2s; }
        .resume-page section:nth-of-type(3) { animation-delay: 0.26s; }
        .resume-page footer { animation-delay: 0.32s; }
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
          .resume-page {
            padding: 0;
            font-size: 10.2px;
            line-height: 1.42;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #fff;
          }
          .resume-page::before { display: none; }
          .resume-page .backlink { display: none; }
          .resume-page .dl { display: none; }
          .resume-page .sheet { max-width: none; padding: 0; animation: none; }
          .resume-page * { animation: none !important; }
          .resume-page header { margin-bottom: 18px; }
          .resume-page h1 { font-size: 36px; }
          .resume-page h1 .en { font-size: 12px; margin-top: 5px; }
          .resume-page .tagline { font-size: 12px; margin: 12px 0 12px; max-width: none; }
          .resume-page .contacts { font-size: 9.5px; gap: 4px 16px; }
          .resume-page .metrics { margin: 16px 0 18px; }
          .resume-page .metric { padding: 11px 12px; }
          .resume-page .metric .big { font-size: 16px; }
          .resume-page .metric .lbl { font-size: 9px; margin-top: 5px; }
          .resume-page section { padding: 15px 0; grid-template-columns: 130px 1fr; gap: 0 26px; break-inside: avoid; }
          .resume-page .sec-title { font-size: 15px; position: static; }
          .resume-page .job-org { font-size: 16px; }
          .resume-page .proj { margin-top: 13px; break-inside: avoid; }
          .resume-page .proj-name { font-size: 12px; }
          .resume-page .proj-desc { font-size: 10px; margin-bottom: 5px; }
          .resume-page li { font-size: 10px; margin: 3px 0; line-height: 1.4; }
          .resume-page li::before { top: 0.5em; }
          .resume-page .skill-row { padding: 5px 0; }
          .resume-page footer { margin-top: 22px; font-size: 8.5px; }
          .resume-page a { color: var(--ink) !important; border: none !important; }
        }
      `}</style>
    </>
  )
}
