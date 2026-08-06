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
  const live = groups.filter((g) => g.inProgress).length

  return (
    <>
      <header className="pb-8">
        <p className="eyebrow text-muted">Work</p>
        {/* FIXED 에만 라임 배경 — 라임을 쓰는 유일한 자리가 아니라 제목의 강조다 */}
        <h1 className="mt-3 text-[52px] font-bold leading-none tracking-[-0.035em] text-ink">
          WHAT{" "}
          <span className="rounded-[3px] bg-lime px-2" style={{ color: "var(--lime-ink)" }}>
            FIXED
          </span>
        </h1>

        {/*
          채널 스트립 — 홈과 같은 규격. 축에 무엇이 몇 개 걸려 있는지 먼저 읽힌다.
          값이 0 인 채널도 낸다. 0 이라는 사실 자체가 정보다.
        */}
        <div className="mt-7 grid grid-cols-3 border border-line bg-surface font-[family-name:var(--font-jbmono)]">
          {[
            { label: "Cases", value: groups.length },
            { label: "Experiences", value: experiences },
            { label: "Live", value: live, lit: live > 0 },
          ].map((ch, i) => (
            <div
              key={ch.label}
              className={`flex items-center gap-2 px-4 py-2.5 ${i < 2 ? "border-r border-line" : ""}`}
            >
              <span
                aria-hidden
                className={`inline-block h-1.5 w-1.5 rounded-full ${ch.lit ? "bg-lime" : "bg-line"}`}
              />
              <span className="text-[10.5px] uppercase tracking-[0.18em] text-muted">
                {ch.label}
              </span>
              <span className="ml-auto text-[13px] text-ink">{ch.value}</span>
            </div>
          ))}
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
