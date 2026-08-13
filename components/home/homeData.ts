/*
  정적 소개 콘텐츠. 원래 홈에서 쓰던 것이라 이 경로에 있다.

  현재 사용처는 `/about` 하나이고 `intro`(소개 2단락)와 `skills`(Skills 카드)를 읽는다.
  홈이 최신 글 중심으로 바뀌면서 이 데이터를 렌더하던 사이드 레일이 없어졌다.
  `whatIDo` 는 export 만 되어 있고 읽는 곳이 없다.
*/

/*
  이력서(`components/resumeDoc.tsx`)의 소개 문단과 **같은 어법**을 쓴다 (#259).
  전에는 이력서가 담백한 어법으로 바뀐 뒤에도 이쪽이 옛 어법("주도적으로 설계·소유하고
  있으며" · "좋아합니다")을 들고 있어서, 두 화면이 같은 사람을 다르게 소개했다.

  같은 문자열을 공유하지는 않는다 — 이력서 소개는 세 문장이고 이곳은 더 말할 자리다.
  대신 마지막 문장은 이력서와 같은 문장을 쓴다. 규칙: **짧은 쪽이 긴 쪽의 요약**이다.
  둘을 한 곳에서 읽게 하는 것은 #260 에서 다룬다.
*/
export const intro: string[] = [
  "Java/Spring으로 개발을 시작해, 금융권 이미지 솔루션 SI에서 C#/.NET으로 3년 넘게 일했습니다. 이후 병원 도메인 SaaS에 프론트엔드로 합류했다가 백엔드로 옮겼습니다.",
  "지금은 그 SaaS의 메시징 백엔드를 맡고 있습니다. 맡은 기능은 설계부터 운영까지 직접 봅니다. 성능과 안정성 문제는 짐작하지 않고 재서 확인한 뒤 고칩니다.",
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

/*
  이력서 `핵심 역량` 6행을 그대로 옮긴 것이다 (#259). 항목까지 일치시켰다.

  전에는 5행이었고 이력서의 부분집합이었다 — `인증 · 연동` 그룹 전체와 Refit ·
  Semantic Kernel · Bicep · App Insights · React-Hook-Form · Vue 가 빠져 있었다.
  반대로 `Docker` 는 이곳에만 있었는데, 이력서를 정본으로 보기로 해서 뺐다(소유자 결정).

  `·` 앞이 주로 쓰는 것, 뒤가 함께 쓰는 것이다 — 이력서는 앞을 굵게 그리고 이곳은 평문으로
  그린다. 문자열 형태를 이력서와 같게 둔 것은 #260 에서 한 배열로 합칠 때 그대로 옮기기
  위한 것이다. **한쪽만 고치면 다시 갈라진다 — 고칠 때 두 곳을 함께 본다.**
*/
export const skills: SkillGroup[] = [
  { group: "Backend", items: "C#, ASP.NET Core, .NET 10, EF Core · MassTransit + RabbitMQ, SignalR, Hangfire, Refit, Polly, Semantic Kernel(Azure OpenAI)" },
  { group: "Architecture", items: "DDD, CQRS(MediatR), 이벤트 기반 · Clean Architecture, 멀티테넌시" },
  { group: "Data", items: "Azure SQL / MS SQL Server, Cosmos DB, Redis · Azure Cognitive Search, EF Core 멀티 스키마 마이그레이션" },
  { group: "인증 · 연동", items: "IdentityServer(OIDC/OAuth2/CIBA) · WhatsApp·Meta Graph, LINE, WeChat, Vonage(SMS OTP)" },
  { group: "Cloud · DevOps", items: "Azure Container Apps, .NET Aspire · Bicep(IaC), GitHub Actions CI/CD, App Insights" },
  { group: "Frontend", items: "React, TypeScript, Next.js · SWR, React-Hook-Form, Vue" },
]
