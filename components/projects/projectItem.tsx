import Link from "next/link"
import Image from "next/image"

export interface ProjectTag {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  projectName: string;
  description: string;
  cover: string;
  tags: ProjectTag[];
  url: string;
  startDate: string;
  endDate: string;
  status: boolean;
  // 케이스스터디용 구조화 필드(선택). Notion 미설정 시 빈 값 → 상세에서 우아하게 폴백.
  impact?: string;
  role?: string;
  teamSize?: string;
  liveUrl?: string;
}

const cardClass =
  "card group flex h-full flex-col overflow-hidden break-inside-avoid mb-8 " +
  "hover:border-accent/60 hover:bg-surface-hover motion-safe:hover:-translate-y-0.5 " +
  "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export default function ProjectItem({ data }: { data: Project }) {
  const glyph = Array.from(data.projectName)[0] ?? "·";
  const firstTag = data.tags?.[0]?.name;
  // status: true = Done, false = 진행 중
  const inProgress = !data.status;
  // 프로젝트명 기반 결정적 각도(해치 텍스처가 카드마다 조금씩 달라지도록)
  const hatchAngle =
    (Array.from(data.projectName).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4) * 45;

  const hasPeriod = Boolean(data.startDate);
  const period = `${data.startDate} — ${data.endDate || "현재"}`;

  const body = (
    <>
      {/* Cover strip */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {data.cover ? (
          <Image
            src={data.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            // Notion 커버 호스트(app.notion.com 등)가 remotePatterns 밖이면 최적화기가 400.
            // 커버는 임의 호스트라 unoptimized 로 원본 서빙(어떤 호스트든 표시 보장). lazy/레이아웃은 유지.
            unoptimized
            className="object-cover grayscale-[15%] opacity-95 transition group-hover:grayscale-0 group-hover:opacity-100 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="relative flex h-full w-full items-center justify-center bg-page"
            style={{
              backgroundImage: `repeating-linear-gradient(${hatchAngle}deg, var(--border) 0 1px, transparent 1px 8px)`,
            }}
          >
            <span className="font-mono text-4xl font-extrabold text-muted/40">{glyph}</span>
            {firstTag && (
              <span className="absolute right-3 top-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                {firstTag}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-fg group-hover:text-accent">
          <span
            aria-hidden
            className={`text-xs ${inProgress ? "text-accent" : "text-muted"}`}
          >
            {inProgress ? "●" : "○"}
          </span>
          <span className="line-clamp-1">{data.projectName}</span>
        </h3>

        {data.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted line-clamp-2">
            {data.description}
          </p>
        )}

        {data.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="chip">
                {tag.name}
              </span>
            ))}
            {data.tags.length > 3 && (
              <span className="chip">+{data.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
          <span className="font-mono text-xs text-muted">{hasPeriod ? period : ""}</span>
          <span className="text-sm text-accent group-hover:text-accent-hover">
            자세히 →
          </span>
        </div>
      </div>
    </>
  );

  // 카드 전체를 프로젝트 상세 페이지 링크로(케이스스터디). GitHub/live 링크는 상세에서 노출.
  // 앵커 중첩을 피하기 위해 내부에는 별도의 <a>/<Link> 를 두지 않는다.
  return (
    <Link href={`/projects/${data.id}`} className={cardClass}>
      {body}
    </Link>
  );
}
