import Link from "next/link"
import Layout from "../components/layout"

const intro = [
  "Java/Spring으로 개발을 시작해 금융권 이미지 솔루션 SI에서 C#/.NET으로 3년 이상 개발했습니다. 이후 병원 도메인 SaaS에 프론트엔드로 합류했다가 백엔드로 전환했습니다.",
  "최근 2년 이상 멀티플랫폼 채팅/메시징 백엔드를 주도적으로 설계·소유하고 있으며, React 프론트엔드까지 직접 개발합니다. 성능·안정성 문제를 원리부터 이해해 정량적으로 풀어가는 것을 좋아합니다.",
]

const whatIDo = [
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

const skills = [
  { group: "Backend", items: "C#, ASP.NET Core, .NET 10, EF Core, SignalR, MassTransit, RabbitMQ, Hangfire, Polly" },
  { group: "Database", items: "Azure SQL / MSSQL, Cosmos DB, Redis, Azure Cognitive Search" },
  { group: "Architecture", items: "DDD, Clean Architecture, CQRS(MediatR), 이벤트 기반, 멀티테넌시" },
  { group: "Cloud", items: "Azure Container Apps, .NET Aspire, GitHub Actions, Docker" },
  { group: "Frontend", items: "React, TypeScript, Next.js, SWR" },
]

function Section({ n, title, children }) {
  return (
    <section className="border-t border-line py-10">
      <h2 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-muted">
        <span className="mr-2 text-accent">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function Home() {
  return (
    <Layout title="Sejune Oh — 백엔드 개발자">
      {/* Hero */}
      <section className="pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
          Backend Engineer · Fullstack
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.25] tracking-tight text-fg sm:text-[40px] sm:leading-[1.2]">
          헬스케어 SaaS의 채팅/메시징 백엔드를 설계·운영하는 C#/.NET 백엔드 개발자.
        </h1>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/projects" className="btn-accent">프로젝트 보기</Link>
          <Link
            href="/blog"
            className="inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface"
          >
            블로그
          </Link>
        </div>
      </section>

      <Section n="01" title="About">
        <div className="space-y-4 text-[15px] leading-relaxed text-muted">
          {intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Section>

      <Section n="02" title="What I do">
        <div className="grid gap-4 sm:grid-cols-2">
          {whatIDo.map((w) => (
            <div key={w.title} className="border-l-2 border-accent/40 pl-4">
              <h3 className="text-[15px] font-semibold text-fg">{w.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section n="03" title="Stack">
        <dl className="divide-y divide-line">
          {skills.map((s) => (
            <div key={s.group} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[110px_1fr]">
              <dt className="font-mono text-xs text-accent">{s.group}</dt>
              <dd className="text-sm text-muted">{s.items}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section n="04" title="Featured">
        <Link href="/projects" className="group block">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-xl font-bold text-fg group-hover:text-accent">
              멀티플랫폼 채팅/메시징 백엔드
            </h3>
            <span className="whitespace-nowrap font-mono text-xs text-muted">2024.09 – 현재</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            실시간 상담 채팅을 SignalR 이벤트 엔진에서 시작해 WhatsApp·LINE·WeChat 통합을 거쳐
            독립 플랫폼(Omni)으로 재구축한 2.5년 백엔드 오너십.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[".NET 10", "SignalR", "MassTransit", "Cosmos DB", "Redis"].map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
          <span className="mt-5 inline-block text-sm text-accent">프로젝트 전체 보기 →</span>
        </Link>
      </Section>
    </Layout>
  )
}
