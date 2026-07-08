// 홈 페이지에서 사용하는 정적 콘텐츠 (intro / whatIDo / skills)

export const intro: string[] = [
  "Java/Spring으로 개발을 시작해 금융권 이미지 솔루션 SI에서 C#/.NET으로 3년 이상 개발했습니다. 이후 병원 도메인 SaaS에 프론트엔드로 합류했다가 백엔드로 전환했습니다.",
  "최근 2년 이상 멀티플랫폼 채팅/메시징 백엔드를 주도적으로 설계·소유하고 있으며, React 프론트엔드까지 직접 개발합니다. 성능·안정성 문제를 원리부터 이해해 정량적으로 풀어가는 것을 좋아합니다.",
]

export interface WhatIDoItem {
  title: string
  body: string
}

export const whatIDo: WhatIDoItem[] = [
  {
    title: "실시간 채팅/메시징 백엔드 오너십",
    body: "SignalR 이벤트 엔진 → WhatsApp·LINE·WeChat 통합 → 독립 플랫폼(Omni) 재구축. 프로덕션 8개 병원 테넌트 운영.",
  },
  {
    title: "대용량 API 성능·안정성 개선",
    body: "EF Core 쿼리 최적화, HTTP 복원력(Polly), 백그라운드 작업 영속화, Redis 세션 인프라로 장애에 강한 시스템 설계.",
  },
  {
    title: "DDD · CQRS · 이벤트 기반 아키텍처",
    body: ".NET 10, MassTransit + RabbitMQ 기반 이벤트 아키텍처와 멀티테넌시 도메인 설계.",
  },
]

export interface SkillGroup {
  group: string
  items: string
}

export const skills: SkillGroup[] = [
  { group: "Backend", items: "C#, ASP.NET Core, .NET 10, EF Core, SignalR, MassTransit, RabbitMQ, Hangfire, Polly" },
  { group: "Database", items: "Azure SQL / MSSQL, Cosmos DB, Redis, Azure Cognitive Search" },
  { group: "Architecture", items: "DDD, Clean Architecture, CQRS(MediatR), 이벤트 기반, 멀티테넌시" },
  { group: "Cloud", items: "Azure Container Apps, .NET Aspire, GitHub Actions, Docker" },
  { group: "Frontend", items: "React, TypeScript, Next.js, SWR" },
]
