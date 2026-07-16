import type { Experience } from "../components/projects/projectItem"

// Notion 연동이 비어 있을 때 사용하는 큐레이션된 대체 경험 목록.
// site/resume에 이미 존재하는 사실만 사용하고, 새로운 지표는 만들지 않는다.
// group 으로 대분류(프로젝트) 묶음이 결정된다(라이브 Notion과 동일 구조).
const CH_API = "CloudHospital.Api 백엔드"
const OMNI = "Omni 메시징 백엔드"
const EHRAPI = "EhrApi 이벤트 백엔드"
const CH_API_SUMMARY =
  "병원 SaaS 플랫폼의 .NET 백엔드 — API 성능, HTTP 복원력, passwordless 인증 전반에 걸친 기여."
const OMNI_SUMMARY =
  "SignalR 이벤트 엔진에서 출발해 독립 플랫폼으로 재구축한 멀티채널(WhatsApp·LINE·WeChat) 메시징 백엔드."
const EHRAPI_SUMMARY =
  "MassTransit/RabbitMQ 이벤트 아키텍처와 멀티테넌시를 적용한 병원 EHR 백엔드."

export const fallbackExperiences: Experience[] = [
  {
    id: "omni-messaging-backend",
    projectName: "멀티플랫폼 채팅/메시징 백엔드 (Omni)",
    description:
      "SignalR 이벤트 엔진에서 시작해 WhatsApp·LINE·WeChat 통합을 거쳐 독립 플랫폼(Omni)으로 재구축한 백엔드 오너십.",
    cover: "",
    tags: [
      { id: "dotnet", name: ".NET 10" },
      { id: "signalr", name: "SignalR" },
      { id: "masstransit", name: "MassTransit" },
      { id: "cosmos", name: "Cosmos DB" },
      { id: "redis", name: "Redis" },
    ],
    url: "",
    startDate: "2024.09",
    endDate: "",
    status: false,
    impact:
      "실시간 메시지 파이프라인 병목 제거 — 매니저 조회 147ms→4ms(−97%), broadcast 실시간 알림 누락을 커밋-전-발행 레이스까지 추적해 수정",
    role: "백엔드 설계·구현 오너십 — SignalR 알림 체인, 트랜잭션 커밋-후 이벤트 발행 인터셉터, 송수신 latency 계측·최적화",
    group: OMNI,
    groupSummary: OMNI_SUMMARY,
  },
  {
    id: "ef-core-query-optimization",
    projectName: "EF Core 쿼리 최적화",
    description:
      "ProjectTo 위에 남아 있던 Include가 만든 카테시안 폭발을 AsSplitQuery로 잡아 91초 걸리던 API를 0.04초로 개선.",
    cover: "",
    tags: [
      { id: "efcore", name: "EF Core" },
      { id: "csharp", name: "C#" },
      { id: "performance", name: "Performance" },
    ],
    url: "",
    startDate: "2026.05",
    endDate: "2026.07",
    status: true,
    impact:
      "GET /hospitals 91초→0.04초(약 2000배) — Include+ProjectTo가 만든 1.38억 rows 카테시안 폭발을 AsSplitQuery로 해소",
    role: "prd 타임아웃(103건) 근본 원인 분석·쿼리 최적화 — 로컬 SQL 실측으로 페이로드 MD5 동일성·회귀 zero 검증",
    group: CH_API,
    groupSummary: CH_API_SUMMARY,
  },
  {
    id: "polly-http-resilience",
    projectName: "HTTP 복원력 계층 (Polly)",
    description:
      "전이성 네트워크·5xx 실패로 쌓인 자동 리포트를 지수 백오프 재시도와 토큰 캐싱으로 구조적으로 줄인 복원력 계층.",
    cover: "",
    tags: [
      { id: "polly", name: "Polly" },
      { id: "dotnet-res", name: ".NET" },
      { id: "resilience", name: "Resilience" },
    ],
    url: "",
    startDate: "2026.06",
    endDate: "2026.06",
    status: true,
    impact:
      "일시적 네트워크·5xx 실패로 쌓인 자동 버그 보고 333건의 근본 원인을 Polly 재시도(지수 백오프)+AD 토큰 캐싱으로 제거",
    role: "솔루션 전반의 HTTP 복원력 계층 신규 설계·도입 — 공통 Polly 정책, 토큰 캐시(Singleton), silent failure 제거",
    group: CH_API,
    groupSummary: CH_API_SUMMARY,
  },
  {
    id: "sms-ciba-authentication",
    projectName: "SMS CIBA 인증",
    description:
      "SMS 기반 CIBA(Client-Initiated Backchannel Authentication) 인증 흐름을 백엔드에 통합한 작업.",
    cover: "",
    tags: [
      { id: "ciba", name: "CIBA" },
      { id: "auth", name: "Auth" },
      { id: "sms", name: "SMS" },
    ],
    url: "",
    startDate: "2025.01",
    endDate: "2025.03",
    status: true,
    impact:
      "CIBA 기반 passwordless OTP 로그인을 IdentityServer에 통합 — OTP 재전송 레이트 리미팅으로 남용 방지",
    role: "CIBA OTP 인증 흐름 통합 및 재전송 레이트 리미팅 구현 (IdentityServer STS)",
    group: CH_API,
    groupSummary: CH_API_SUMMARY,
  },
  {
    id: "ehrapi-event-driven-backend",
    projectName: "EhrApi 이벤트 기반 백엔드",
    description:
      "MassTransit + RabbitMQ 기반 이벤트 아키텍처와 멀티테넌시 도메인 설계를 적용한 병원 도메인 백엔드.",
    cover: "",
    tags: [
      { id: "ddd", name: "DDD" },
      { id: "cqrs", name: "CQRS" },
      { id: "rabbitmq", name: "RabbitMQ" },
      { id: "multitenancy", name: "멀티테넌시" },
    ],
    url: "",
    startDate: "2022.01",
    endDate: "2024.08",
    status: true,
    impact:
      "이벤트 기반(MassTransit/RabbitMQ) EHR 백엔드 — 발행·SignalR 알림·멀티테넌트 격리, E2E Epic 100%·테스트 999/999 통과",
    role: "Integration Event 발행 배관·SignalR 실시간 알림 consumer·2단계 RBAC 테넌트 격리 구현 및 테스트",
    group: EHRAPI,
    groupSummary: EHRAPI_SUMMARY,
  },
]
