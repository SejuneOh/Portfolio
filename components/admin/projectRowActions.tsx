"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteProject } from "../../app/admin/actions"
import { useToast } from "./toast"

export default function ProjectRowActions({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const { show, node } = useToast()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (busy) return
    if (!confirm(`“${name}”을(를) 삭제(아카이브)할까요? Notion 휴지통에서 복구할 수 있습니다.`)) return
    setBusy(true)
    try {
      await deleteProject(id)
      show("success", "삭제(아카이브)했습니다.")
      router.refresh()
    } catch {
      show("error", "삭제에 실패했습니다. 잠시 후 다시 시도해주세요.")
    }
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <Link href={`/admin/projects/${id}/edit`} className="link-underline text-muted hover:text-accent">
        수정
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="link-underline text-muted hover:text-red-500 disabled:opacity-50"
      >
        삭제
      </button>
      {node}
    </div>
  )
}
