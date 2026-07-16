import Link from "next/link"
import Image from "next/image"
import type { Block } from "../../lib/posts"

export interface ProjectTag {
  id: string;
  name: string;
}

// 하나의 "경험/기여"(Notion 행 1개). 여러 경험이 하나의 대분류 프로젝트로 묶인다.
export interface Experience {
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
  // 대분류(프로젝트) 그룹핑. group 미설정 시 이 경험이 독립 프로젝트가 된다.
  group?: string;
  groupSummary?: string;
  // 상세 페이지에서 채워지는 본문 블록.
  body?: Block[];
}

// 대분류(실제 프로젝트). 경험 여러 개를 묶는다.
export interface ProjectGroup {
  slug: string;
  name: string;
  summary: string;
  cover: string;
  tags: ProjectTag[];
  startDate: string;
  endDate: string;
  inProgress: boolean;
  count: number;
  experiences: Experience[];
}

// "2024-09-01" / "2024.09" → "2024.09"
function fmt(d?: string) {
  if (!d) return "";
  const [y, m] = d.replace(/\./g, "-").split("-");
  return m ? `${y}.${m}` : y;
}

const cardClass =
  "card group flex h-full flex-col overflow-hidden " +
  "hover:border-accent/60 hover:bg-surface-hover motion-safe:hover:-translate-y-0.5 " +
  "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

// 대분류(프로젝트) 카드. 목록/홈 공용.
export default function ProjectItem({ data }: { data: ProjectGroup }) {
  const glyph = Array.from(data.name)[0] ?? "·";
  const firstTag = data.tags?.[0]?.name;
  const inProgress = data.inProgress;
  const hatchAngle =
    (Array.from(data.name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4) * 45;

  const hasPeriod = Boolean(data.startDate);
  const period = `${fmt(data.startDate)} — ${data.inProgress ? "현재" : fmt(data.endDate) || "현재"}`;

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
          <span className="line-clamp-1">{data.name}</span>
        </h3>

        {data.summary && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted line-clamp-2">
            {data.summary}
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
          <span className="flex items-center gap-2 text-sm text-accent group-hover:text-accent-hover">
            {data.count > 1 && (
              <span className="font-mono text-xs text-muted">경험 {data.count}</span>
            )}
            자세히 →
          </span>
        </div>
      </div>
    </>
  );

  return (
    <Link href={`/projects/${data.slug}`} className={cardClass}>
      {body}
    </Link>
  );
}
