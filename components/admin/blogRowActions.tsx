"use client"

import { useTransition } from "react"
import Link from "next/link"
import { deleteBlogPost, togglePublish } from "../../app/admin/blog/actions"

export default function BlogRowActions({
  id,
  title,
  published,
}: {
  id: string
  title: string
  published: boolean
}) {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-3 text-xs">
      <Link href={`/admin/blog/${id}/edit`} className="link-underline text-muted hover:text-accent">
        수정
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => togglePublish(id, !published))}
        className="link-underline text-muted hover:text-accent disabled:opacity-50"
      >
        {published ? "비공개로" : "발행"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm(`“${title}”을(를) 삭제(아카이브)할까요? Notion 휴지통에서 복구할 수 있습니다.`)) {
            start(() => deleteBlogPost(id))
          }
        }}
        className="link-underline text-muted hover:text-red-500 disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  )
}
