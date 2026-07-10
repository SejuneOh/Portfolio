"use client"

import { useActionState } from "react"
import Link from "next/link"
import { saveBlogPost } from "../../app/admin/blog/actions"
import { Field, Status, fieldCls, labelCls } from "./formFields"
import type { ActionState } from "../../lib/adminForm"

const INIT: ActionState = { ok: false, message: "" }

export interface BlogFormInitial {
  id?: string
  title?: string
  slug?: string
  date?: string
  category?: string
  tags?: string
  summary?: string
  body?: string
  published?: boolean
}

export default function BlogPostForm({ initial = {} }: { initial?: BlogFormInitial }) {
  const [state, action, pending] = useActionState(saveBlogPost, INIT)
  const isEdit = Boolean(initial.id)

  return (
    <form action={action} className="grid gap-4">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}

      <Field label="제목" name="title" placeholder="글 제목" required defaultValue={initial.title} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug" name="slug" placeholder="비우면 제목에서 생성" defaultValue={initial.slug} />
        <Field label="날짜" name="date" type="date" defaultValue={initial.date} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="카테고리" name="category" placeholder="Performance / Backend …" defaultValue={initial.category} />
        <Field label="태그 (쉼표로 구분)" name="tags" placeholder="EF Core, C#" defaultValue={initial.tags} />
      </div>
      <label className="block">
        <span className={labelCls}>요약</span>
        <textarea name="summary" rows={2} className={fieldCls} placeholder="목록에 보일 한두 문장" defaultValue={initial.summary} />
      </label>
      <label className="block">
        <span className={labelCls}>본문 (마크다운 유사: # 제목, ``` 코드, - 목록)</span>
        <textarea
          name="body"
          rows={14}
          className={`${fieldCls} font-mono`}
          placeholder={"## 소제목\n문단 내용...\n\n- 목록 항목\n\n```\n코드\n```"}
          defaultValue={initial.body}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" name="published" defaultChecked={initial.published ?? true} className="h-4 w-4 rounded border-line" />
        발행 (Published)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "저장 중…" : isEdit ? "변경 저장" : "글 등록"}
        </button>
        <Link href="/admin/blog" className="link-underline text-sm text-muted">
          취소
        </Link>
      </div>
      <Status state={state} />
    </form>
  )
}
