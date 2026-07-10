"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteBlogPost, togglePublish } from "../../app/admin/blog/actions"
import { useToast } from "./toast"

export default function BlogRowActions({
  id,
  title,
  published,
}: {
  id: string
  title: string
  published: boolean
}) {
  const router = useRouter()
  const { show, node } = useToast()
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<void>, successMsg: string) {
    if (busy) return
    setBusy(true)
    try {
      await fn()
      show("success", successMsg)
      router.refresh()
    } catch {
      show("error", "처리에 실패했습니다. 잠시 후 다시 시도해주세요.")
    }
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <Link href={`/admin/blog/${id}/edit`} className="link-underline text-muted hover:text-accent">
        수정
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={() => run(() => togglePublish(id, !published), published ? "비공개로 전환했습니다." : "발행했습니다.")}
        className="link-underline text-muted hover:text-accent disabled:opacity-50"
      >
        {published ? "비공개로" : "발행"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirm(`“${title}”을(를) 삭제(아카이브)할까요? Notion 휴지통에서 복구할 수 있습니다.`)) {
            run(() => deleteBlogPost(id), "삭제(아카이브)했습니다.")
          }
        }}
        className="link-underline text-muted hover:text-red-500 disabled:opacity-50"
      >
        삭제
      </button>
      {node}
    </div>
  )
}
