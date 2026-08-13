/*
  이력서 내용. 전에는 components/resumeDoc.tsx 의 JSX 리터럴이었다 (#262 1단계).

  왜 뺐나 — 이력서를 배포 없이 고칠 수 있게 하려면 내용이 **주소를 가진 데이터**여야 한다.
  2단계에서 Notion 을 원본으로 두고, 이 파일은 그때 **폴백**이 된다
  (lib/projectsFallback.ts 와 같은 자리 — 토큰이 없어도 화면이 유지된다).

  ## 강조 표기

  본문 문자열은 인라인 표기를 쓴다. 그리는 것은 components/resumeDoc.tsx 이고
  쪼개는 것은 lib/inlineTokens.ts 다 (블로그 본문과 같은 문법·같은 스캐너).

      **결과**      → <b>       항목당 하나. 그 항목의 결과에만 (#256)
      `194 → 3ms`   → .kbd 칩   재서 확인한 전후 값 전용 (#256)

  기술 이름에는 둘 다 쓰지 않는다. 전에는 한 줄에 굵은 곳이 최대 5개였고 칩이 기술 이름과
  측정값에 똑같이 붙어 있어서, 무엇이 성과인지 눈으로 골라낼 수 없었다.

  ## 여기 없는 것 (코드가 소유한다)

  섹션 구성과 순서 · 연도 칩 정렬 · A4 인쇄 조판 · 강조 규칙 자체. 관리 화면(3단계)에서도
  이것들은 열지 않는다 — 내용이 임의로 늘면 인쇄가 조용히 3쪽이 되고(#226 이 2쪽에 맞춘 것),
  강조를 여럿 달면 #256 이 없앤 문제가 그대로 돌아온다.
*/

export interface ResumeContact {
  text: string
  /** 없으면 링크가 아닌 그냥 글자로 그린다 (예: "경력 7년 6개월") */
  href?: string
}

export interface ResumeHeader {
  eyebrow: string
  name: string
  /** 이름 아래 한 줄 (라틴) */
  nameSub: string
  /** 소개 문단. 굵은 강조도 수치도 쓰지 않는다 (#256) */
  tagline: string
  contacts: ResumeContact[]
}

export interface ResumeMetric {
  /** 앞에 흐리게 오는 값 (예: "91s") */
  from?: string
  /** from 과 value 사이에 화살표를 넣는다 */
  arrow?: boolean
  value: string
  /** 뒤에 흐리게 오는 값 (예: "%", "/782") */
  after?: string
  /** "%" 처럼 단위 기호일 때 더 작게 */
  afterSmall?: boolean
  /** 줄바꿈 단위로 나눈 설명 */
  label: string[]
}

export interface ResumeSkillRow {
  group: string
  /** 주로 쓰는 것 — 굵게 그린다 */
  primary: string
  /** 함께 쓰는 것 — `·` 뒤에 평문으로 */
  also?: string
}

export interface ResumeBullet {
  /** 연도. 모르면 비운다 — 지어내지 않는다. 빈 값도 자리를 차지해 왼쪽 선을 맞춘다 */
  year?: string
  text: string
}

export type ResumeCareerEntry =
  | { kind: "job"; org: string; when?: string; role?: string }
  | {
      kind: "project"
      name: string
      /** 제목 앞의 ◆ */
      star?: boolean
      when?: string
      desc?: string
      bullets: ResumeBullet[]
    }

export interface ResumeEduItem {
  name: string
  meta: string
  desc?: string
}

export interface ResumeSection {
  num: string
  title: string
}

export interface ResumeData {
  header: ResumeHeader
  metrics: ResumeMetric[]
  skills: ResumeSkillRow[]
  career: ResumeCareerEntry[]
  side: string[]
  education: ResumeEduItem[]
  /** 문서 하단 좌·우 */
  footer: [string, string]
}

export const resumeData: ResumeData = {
  header: {
    eyebrow: "Backend Engineer · Fullstack",
    name: "오세준",
    nameSub: "Sejune Oh — 백엔드 개발자 · 풀스택",
    tagline:
      "C#/.NET으로 서버를 만듭니다. 지금은 병원 도메인 SaaS의 메시징 백엔드를 맡고 있습니다. 맡은 기능은 설계부터 운영까지 직접 봅니다.",
    contacts: [
      { text: "etry0715@gmail.com", href: "mailto:etry0715@gmail.com" },
      { text: "github.com/SejuneOh", href: "https://github.com/SejuneOh" },
      { text: "경력 7년 6개월" },
    ],
  },

  metrics: [
    {
      from: "91s",
      arrow: true,
      value: "0.04s",
      label: ["병원 목록 API 응답", "쿼리 최적화 (#11165)"],
    },
    {
      value: "−97",
      after: "%",
      afterSmall: true,
      label: ["메시지 조회 지연", "147ms → 4ms"],
    },
    {
      value: "782",
      after: "/782",
      label: ["데이터 마이그레이션", "무결성 검증 통과"],
    },
  ],

  /*
    'AI 연동' 행은 따로 두지 않는다 — Semantic Kernel 은 .NET 라이브러리라 Backend 에서
    쓰는 것이고, 행을 쪼개면 한 줄에 항목 두 개짜리 행이 생긴다 (#256).
    /about 의 Skills 카드도 이 여섯 행과 같아야 한다 (#259).
  */
  skills: [
    {
      group: "Backend",
      primary: "C#, ASP.NET Core, .NET 10, EF Core",
      also: "MassTransit + RabbitMQ, SignalR, Hangfire, Refit, Polly, Semantic Kernel(Azure OpenAI)",
    },
    {
      group: "Architecture",
      primary: "DDD, CQRS(MediatR), 이벤트 기반",
      also: "Clean Architecture, 멀티테넌시",
    },
    {
      group: "Data",
      primary: "Azure SQL / MS SQL Server, Cosmos DB, Redis",
      also: "Azure Cognitive Search, EF Core 멀티 스키마 마이그레이션",
    },
    {
      group: "인증 · 연동",
      primary: "IdentityServer(OIDC/OAuth2/CIBA)",
      also: "WhatsApp·Meta Graph, LINE, WeChat, Vonage(SMS OTP)",
    },
    {
      group: "Cloud · DevOps",
      primary: "Azure Container Apps, .NET Aspire",
      also: "Bicep(IaC), GitHub Actions CI/CD, App Insights",
    },
    {
      group: "Frontend",
      primary: "React, TypeScript, Next.js",
      also: "SWR, React-Hook-Form, Vue",
    },
  ],

  career: [
    {
      kind: "job",
      org: "클라우드호스피탈",
      when: "2023.02 – 재직중 · 정규직",
      role: "병원 도메인 SaaS · 백엔드 중심 풀스택 (2023 React 프론트엔드로 입사 → 2024 백엔드 전환)",
    },

    /*
      메시징 이야기가 세 블록(오너십 / WhatsApp 통합 / 속도 최적화)으로 흩어져 있었다.
      기간이 겹쳐 순서를 따라 읽을 수 없었고, 하나의 소유권이 작은 일 셋으로 보였다.
      연도 순서가 드러나는 한 블록으로 합쳤다 (#256).
    */
    {
      kind: "project",
      star: true,
      name: "멀티플랫폼 메시징 플랫폼 설계·소유",
      when: "· 2024.09~현재",
      desc: "상담 채팅 백엔드를 이벤트 엔진 구축부터 독립 서비스 분리까지 소유. 프로덕션에서 8개 병원 테넌트가 쓴다.",
      bullets: [
        {
          year: "2024",
          text: "실시간 채팅 이벤트 엔진(CloudHospital.MessageBroker)을 단독 구축하고 WhatsApp Chat API를 통합 — SignalR로 상담원 입·퇴장·메시지·핸드오프 이벤트를 처리하고, 세션 CRUD·웹훅·**상담원 이관**까지 동작",
        },
        {
          year: "2025",
          text: "메인 API의 채팅 서브시스템을 **단독 소유**(연 153 PR) — 플랫폼에 종속되지 않는 ChatSession 도메인 모델(활성·만료 분리), 중복 세션 방지, 교차병원 세션 관리, Cosmos DB 쿼리를 클라이언트측에서 서버측으로 이전",
        },
        {
          year: "2025",
          text: "메시지 모달리티 3종(미디어·템플릿·설문 플로우)과 24시간 세션 윈도우를 구현하고 Meta Graph API로 재플랫폼 — **Redis 세션 캐시 계층** 도입(생성 실패 시 재초기화), 미응답·미배정 상담원 알림(SignalR·이메일)을 테넌트 단위 라우팅으로 재구축",
        },
        {
          year: "2026",
          text: "채팅 백엔드를 독립 서비스 **Omni**로 재플랫폼 — .NET 10, DDD/CQRS(MediatR), MassTransit + RabbitMQ 이벤트 기반, EF Core 10 멀티 스키마, WhatsApp·LINE·WeChat 통합(Refit·HMAC-SHA256 웹훅)",
        },
        {
          year: "2026",
          text: "MediatR·MassTransit 필터로 3계층 계측을 깔아 병목을 분리 — 메시지 조회 `194 → 3ms`, 매니저 조회 `147 → 4ms`. 남은 자동번역 지연의 80%는 외부 RAG API임을 규명",
        },
      ],
    },

    {
      kind: "project",
      star: true,
      name: "병원 도메인 API 성능·안정화",
      when: "· 2024, 2026",
      bullets: [
        {
          year: "2024",
          text: "의사·병원 도메인 API와 Azure Cognitive Search 문서모델을 동기화하고, Doctors V3 응답 페이로드에서 약 **1,800줄**을 제거",
        },
        {
          year: "2026",
          text: "병원 목록 API의 카테시안 폭발(단일 쿼리 1.38억 row)을 찾아 EF Core ProjectTo + AsSplitQuery 로 분리 — `91초 → 0.04초`, 180초에 타임아웃 나던 v2는 0.26초",
        },
        // 아래 둘은 연도를 모른다 — 원본에도 표시가 없었고 지어내지 않는다 (#256).
        {
          text: "Polly 재시도·타임아웃 정책을 3개 프로젝트에 도입해 외부 호출 장애 **333건**을 흡수, Azure AD 토큰 발급을 요청당 `N회 → 1회`로 캐싱",
        },
        {
          text: "Hangfire 작업을 In-Memory에서 SQL Server로 영속화하고, 클라이언트 이탈 오탐을 고쳐 오류 리포트 **1,959건**을 없앰",
        },
      ],
    },

    {
      kind: "project",
      star: true,
      name: "인증: CIBA · 게스트 액세스",
      when: "· 2024~2025",
      bullets: [
        {
          text: "SMS 기반 **CIBA**(Client-Initiated Backend Authentication) 로그인 구현 — Vonage OTP 연동, 레거시 STS API를 신규 Identity Admin API로 이전(IdentityServer)",
        },
        {
          text: "비로그인 게스트 채팅 API 설계 — OAuth client-credentials, 401·405를 타입으로 명시한 OpenAPI 오류 계약, 유저 수정·삭제 시 강제 로그아웃",
        },
      ],
    },

    {
      kind: "project",
      star: true,
      name: "AI 번역 신뢰성 · EhrApi 이벤트 파이프라인",
      when: "· 2026",
      bullets: [
        {
          text: "희귀 언어 의료 용어의 번역 실패 원인을 4단계로 규명 → Semantic Kernel 전사를 **GPT-4.x에서 GPT-5.4로 이전**, 토큰 상한으로 무한 반복을 차단",
        },
        {
          text: "신규 구축에 참여한 EhrApi(.NET 10 · FHIR)에 MassTransit 이벤트 발행 파이프라인(CQRS 핸들러 5개)과 HIPAA 감사 로그 커밋 순서 제어를 구현 — **테스트 999개 전량 통과**",
        },
      ],
    },

    {
      kind: "project",
      name: "React Admin 프론트엔드",
      when: "· 2023.02~2024 초",
      bullets: [
        {
          text: "Admin 페이지를 Redux에서 **SWR 커스텀 훅**으로 이전하고, Formik을 React-Hook-Form으로 전환",
        },
        {
          text: "백엔드 전환 이후에도 SaaS 랜딩 기능·인도 지역 언어 i18n·Redis/ISR 캐싱 등 프론트엔드를 병행",
        },
      ],
    },

    {
      kind: "job",
      org: "인지소프트",
      when: "2017.12 – 2021.07 · 정규직",
      role: "금융권 이미지 솔루션 SI · 개발/유지보수 (C#/.NET, Java)",
    },
    {
      kind: "project",
      name: "",
      desc: "은행·카드·증권 고객사에 문서 인식·전자문서·이미지 보안 솔루션을 납품하는 SI 업체.",
      bullets: [
        {
          text: "**현대카드** 법원문서 인식 서버 연동 모듈 — VB6/Java로 JSON API 통신 모듈 개발, 인식 영역 처리로 단어 인식률 개선",
        },
        {
          text: "**대구은행** 디지털 창구 전자문서 — C# 창구 클라이언트 유지보수, PDF 서식 개발",
        },
        { text: "이미지 암·복호화 솔루션의 C#/Java 마이그레이션 및 사용자 웹페이지 개발" },
        { text: "신한은행·수협·대신증권 등 다수 고객사의 C#(WinForm/.NET) 프로그램 유지보수" },
      ],
    },
  ],

  side: [
    "**농구 게스트 호스팅 서비스** — React/TS + Nest.js, MongoDB, Kakao Map 연동 SPA (REST API·인증·게시글 CRUD)",
    "**꾸다 렌탈 기업연계 결제/백오피스** — Node.js/Express/MongoDB, JWT 로그인, Multipart 이미지 업로드, Git-flow 도입",
    "**NYTimes 검색 웹** — Redux-Toolkit, LocalStorage 검색 기록, Styled-Components",
  ],

  education: [
    { name: "백석문화대학교 · 스마트폰 컨텐츠학과", meta: "2012.03 – 2016.12" },
    {
      name: "FastCampus 프론트엔드 개발자 양성 4기",
      meta: "2022.04 – 2022.07",
      desc: "HTML/CSS/JS, React, Next.js",
    },
    {
      name: "삼성 멀티캠퍼스 Java Web 개발자 양성 부트캠프",
      meta: "2016.03 – 2016.09",
      desc: "Java, MSSQL, Spring",
    },
  ],

  footer: ["오세준 · Sejune Oh", "Updated 2026.08 · Backend / Fullstack"],
}

/* 섹션 골격. 순서와 번호는 코드가 소유한다 — 관리 화면에서 바꿀 수 없다 (#262). */
export const RESUME_SECTIONS = {
  skills: { num: "01", title: "핵심 역량" },
  career: { num: "02", title: "경력" },
  side: { num: "03", title: "사이드 프로젝트" },
  education: { num: "04", title: "학력 · 교육" },
} satisfies Record<string, ResumeSection>
