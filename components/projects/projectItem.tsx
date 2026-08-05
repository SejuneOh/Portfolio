import Link from "next/link"
import Image from "next/image"
import type { Block } from "../../lib/posts"
import { fmtMonth } from "../../lib/date";

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
  /*
    개선 전·후 수치. 성과 문장(impact)에 묻혀 있던 값을 재사용할 수 있게 분리한 것이다.
    Notion 스키마 추가와 lib/notion.ts 매핑은 별도 작업이라 지금은 항상 undefined 다.
    현재 이 값을 렌더하는 곳은 홈의 "기록해 둔 수치" 카드 하나이고 조건부라,
    매핑이 들어오면 그때 나타난다.
  */
  metricBefore?: string;
  metricAfter?: string;
  metricLabel?: string;
  /*
    케이스 상세의 문제·접근 타일용. metric 3종과 같은 자리에서 들어오는 값이고
    마찬가지로 아직 매핑이 없어 항상 undefined 다. 케이스 상세가 두 값이 모두
    없으면 타일 전체를 렌더하지 않는다.
  */
  problem?: string;
  approach?: string;
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

const cardClass =
  "card group flex h-full flex-col overflow-hidden " +
  "hover:border-accent/60 hover:bg-surface-hover motion-safe:hover:-translate-y-0.5 " +
  "focus-visible:border-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent/30";

// 대분류(프로젝트) 카드. 목록(/work) 전용 — 홈은 최신 글 중심으로 바뀌어 이 카드를 쓰지 않는다.
export default function ProjectItem({ data }: { data: ProjectGroup }) {
  const glyph = Array.from(data.name)[0] ?? "·";
  const firstTag = data.tags?.[0]?.name;
  const inProgress = data.inProgress;
  const hatchAngle =
    (Array.from(data.name).reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 4) * 45;

  const hasPeriod = Boolean(data.startDate);
  const period = `${fmtMonth(data.startDate)} — ${data.inProgress ? "현재" : fmtMonth(data.endDate) || "현재"}`;

  const body = (
    <>
      {/* Cover strip */}
      <div className="relative aspect-video w-full overflow-hidden">
        {data.cover ? (
          <Image
            src={data.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            className="object-cover grayscale-15 opacity-95 transition group-hover:grayscale-0 group-hover:opacity-100 motion-safe:group-hover:scale-[1.03]"
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
    <Link href={`/work/${data.slug}`} className={cardClass}>
      {body}
    </Link>
  );
}
