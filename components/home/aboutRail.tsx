import Link from "next/link"
import { intro } from "./homeData"

const stack = ["C#", ".NET 10", "EF Core", "SignalR", "MassTransit", "Redis"]

export default function AboutRail() {
  return (
    <aside className="lg:sticky lg:top-14 lg:self-start lg:border-l lg:border-line lg:pl-8">
      {/* Identity */}
      <p className="text-base font-bold text-fg">오세준 (Sejune Oh)</p>
      <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-accent">
        BACKEND · C#/.NET
      </p>

      {/* Intro */}
      <p className="mt-3 text-[13px] leading-relaxed text-muted">{intro[0]}</p>

      <hr className="my-5 border-t border-line" />

      {/* Stack */}
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Stack</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {stack.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>

      <hr className="my-5 border-t border-line" />

      {/* Now */}
      <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        <span aria-hidden className="text-accent">●</span>
        Now
      </p>
      <p className="mt-3 text-[13px] font-medium text-fg">멀티플랫폼 채팅/메시징 백엔드 (Omni)</p>
      <p className="mt-1 font-mono text-[11px] text-muted">2024.09 — 현재 · 진행 중</p>
      <Link href="/projects" className="link-underline mt-4 inline-block text-[13px]">
        전체 프로젝트 →
      </Link>
    </aside>
  )
}
