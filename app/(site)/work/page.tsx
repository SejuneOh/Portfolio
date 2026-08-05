import CaseFilter from "../../../components/projects/caseFilter"
import { getProjectGroups } from "../../../lib/notion"

export const metadata = { title: "Work" }
export const revalidate = 3600

/*
  케이스 목록. Server Component 로 데이터를 받아 정렬까지 끝낸 뒤
  필터 컴포넌트(클라이언트)에 넘긴다. 데이터 페칭 방식은 바꾸지 않았다.
*/
export default async function Work() {
  const groups = await getProjectGroups()

  // 진행 중 → 최신 종료순. 종료일이 비면 시작일로 대신한다.
  const sorted = [...groups].sort((a, b) => {
    if (a.inProgress !== b.inProgress) return a.inProgress ? -1 : 1
    const key = (g: (typeof groups)[number]) => g.endDate || g.startDate || ""
    return key(b).localeCompare(key(a))
  })

  const experiences = groups.reduce((n, g) => n + g.count, 0)

  return (
    <>
      <header className="flex flex-col gap-6 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow text-muted">
            {groups.length} cases · {experiences} experiences
          </p>
          {/* FIXED 에만 라임 배경 — 라임을 쓰는 유일한 자리가 아니라 제목의 강조다 */}
          <h1 className="mt-3 text-[52px] font-bold leading-none tracking-[-0.035em] text-ink">
            WHAT{" "}
            <span
              className="rounded-[6px] bg-lime px-2"
              style={{ color: "var(--lime-ink)" }}
            >
              FIXED
            </span>
          </h1>
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">표시할 케이스가 없습니다.</p>
      ) : (
        <CaseFilter groups={sorted} />
      )}
    </>
  )
}
