import type { Metadata } from "next"
import Link from "next/link"

import ResumeForm from "../../../components/admin/resumeForm"
import { getResume } from "../../../lib/notionResume"

export const metadata: Metadata = {
  title: "이력서 관리",
  robots: { index: false, follow: false },
}

/*
  저장 직후 방금 쓴 값이 보여야 하므로 캐시를 쓰지 않는다 (#262 3단계).
  getResume(true) 도 no-store 로 읽는다 — ISR 캐시가 남아 있으면 "저장했는데 옛 값이
  보인다" 가 되고, 그러면 저장이 실패한 것과 구별할 수 없다.
*/
export const dynamic = "force-dynamic"

export default async function AdminResume() {
  const { data, source } = await getResume(true)

  return (
    <main className="mx-auto max-w-[820px] px-6 py-16">
      <Link href="/admin" className="font-mono text-xs text-muted hover:text-accent">
        ← Admin
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold text-fg">이력서</h1>
        <p className="mt-2 text-sm text-muted">
          <code>/about/resume</code> 와 <code>/about</code> 의 스킬 목록이 이 내용을 함께
          읽습니다. 저장하면 두 화면이 같이 갱신됩니다.
        </p>
      </div>

      <div className="mt-8">
        <ResumeForm
          data={data}
          source={source.from === "notion" ? "notion" : source.reason}
        />
      </div>
    </main>
  )
}
