import type { Project } from "../components/projects/projectItem"

// Notion 연동이 비어 있을 때 사용하는 큐레이션된 대체 프로젝트 목록.
// site/resume에 이미 존재하는 사실만 사용하고, 새로운 지표는 만들지 않는다.
export const fallbackProjects: Project[] = [
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
  },
]
