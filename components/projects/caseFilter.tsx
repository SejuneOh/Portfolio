"use client"

import { useState } from "react"
import CaseRow, { type ProjectGroup } from "./caseRow"

const ALL = "전체"

/*
  축 필터. 페이지(app/(site)/work/page.tsx)는 Server Component 로 남기고
  상호작용이 필요한 이 부분만 클라이언트로 분리한다. 페이지가 데이터를 받아
  정렬까지 끝낸 뒤 넘겨주므로 여기서는 거르기와 렌더만 한다.

  축은 스택 태그다. 케이스를 가르는 기준 중 방문자가 실제로 찾는 것이 기술이고,
  Writing 목록도 같은 자리에 필터 칩 행을 둔다.
*/
export default function CaseFilter({ groups }: { groups: ProjectGroup[] }) {
  const [active, setActive] = useState(ALL)

  // 칩은 실제 등장 횟수 순. 케이스가 하나뿐인 태그까지 늘어놓으면 고르기 어렵다.
  const count = new Map<string, number>()
  for (const g of groups) for (const t of g.tags) count.set(t.name, (count.get(t.name) ?? 0) + 1)
  const axes = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)

  const shown =
    active === ALL ? groups : groups.filter((g) => g.tags.some((t) => t.name === active))

  /*
    비선택 칩은 배경이 없어 테두리가 '누를 수 있다'의 유일한 단서다. border-line(1.38:1)은
    WCAG 1.4.11(비텍스트 3:1)에 못 미쳐 그냥 글자로 보인다 — border-control 을 쓴다 (#229).
    선택 상태는 라임 배경이라 상태 구분에는 원래 문제가 없었다.
  */
  const chip = (on: boolean) =>
    on
      ? "inline-flex items-center gap-1.5 rounded-[3px] bg-lime px-4 py-1.5 text-[13.5px] font-semibold text-[color:var(--lime-ink)] transition-colors hover:bg-[#CDEA55]"
      : "inline-flex items-center gap-1.5 rounded-[3px] border border-control px-4 py-1.5 text-[13.5px] text-ink transition-colors hover:bg-surface-hover"

  return (
    <>
      {/* 칩이 많으면 모바일에서 잘리므로 가로 스크롤을 허용한다 */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => setActive(ALL)}
          aria-pressed={active === ALL}
          className={`${chip(active === ALL)} shrink-0`}
        >
          {ALL}
          <span className="opacity-60">{groups.length}</span>
        </button>
        {axes.map(([name, n]) => (
          <button
            key={name}
            type="button"
            onClick={() => setActive(name)}
            aria-pressed={active === name}
            className={`${chip(active === name)} shrink-0`}
          >
            {name}
            <span className="opacity-60">{n}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">해당하는 케이스가 없습니다.</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {shown.map((g) => (
            <CaseRow key={g.slug} data={g} />
          ))}
        </div>
      )}
    </>
  )
}
