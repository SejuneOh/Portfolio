"use client"

import { useActionState, useState } from "react"
import { submitBlog, submitProject, type ActionState } from "../../app/admin/actions"

const INIT: ActionState = { ok: false, message: "" }

const fieldCls =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
const labelCls = "block text-xs font-medium uppercase tracking-wide text-muted"

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input type={type} name={name} placeholder={placeholder} required={required} className={fieldCls} />
    </label>
  )
}

function Status({ state }: { state: ActionState }) {
  if (!state.message) return null
  return (
    <p
      className={`mt-3 rounded-md px-3 py-2 text-sm ${
        state.ok
          ? "bg-accent/10 text-accent"
          : "border border-line text-muted"
      }`}
      role="status"
    >
      {state.message}
    </p>
  )
}

function BlogForm() {
  const [state, action, pending] = useActionState(submitBlog, INIT)
  return (
    <form action={action} className="grid gap-4">
      <Field label="제목" name="title" placeholder="글 제목" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug" name="slug" placeholder="비우면 제목에서 생성" />
        <Field label="날짜" name="date" type="date" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="카테고리" name="category" placeholder="Performance / Backend …" />
        <Field label="태그 (쉼표로 구분)" name="tags" placeholder="EF Core, C#" />
      </div>
      <label className="block">
        <span className={labelCls}>요약</span>
        <textarea name="summary" rows={2} className={fieldCls} placeholder="목록에 보일 한두 문장" />
      </label>
      <label className="block">
        <span className={labelCls}>본문 (마크다운 유사: # 제목, ``` 코드, - 목록)</span>
        <textarea name="body" rows={12} className={`${fieldCls} font-mono`} placeholder={"## 소제목\n문단 내용...\n\n- 목록 항목\n\n```\n코드\n```"} />
      </label>
      <label className="flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" name="published" defaultChecked className="h-4 w-4 rounded border-line" />
        바로 발행 (Published)
      </label>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "등록 중…" : "블로그 글 등록"}
        </button>
      </div>
      <Status state={state} />
    </form>
  )
}

function ProjectForm() {
  const [state, action, pending] = useActionState(submitProject, INIT)
  return (
    <form action={action} className="grid gap-4">
      <Field label="프로젝트명" name="name" placeholder="프로젝트 이름" required />
      <label className="block">
        <span className={labelCls}>설명</span>
        <textarea name="description" rows={3} className={fieldCls} placeholder="한두 문장 요약" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="태그 (쉼표로 구분)" name="tags" placeholder="C#, Azure" />
        <Field label="GitHub / 링크" name="github" placeholder="https://github.com/…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="시작일" name="startDate" type="date" />
        <Field label="종료일" name="endDate" type="date" />
        <Field label="상태 (status 옵션명)" name="status" placeholder="Done" />
      </div>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "등록 중…" : "프로젝트 등록"}
        </button>
      </div>
      <Status state={state} />
    </form>
  )
}

export default function AdminForms() {
  const [tab, setTab] = useState<"blog" | "project">("blog")
  return (
    <div className="mt-8">
      <div className="mb-6 flex gap-2 border-b border-line pb-3">
        {(["blog", "project"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? "bg-accent text-white" : "border border-line text-muted hover:bg-surface hover:text-fg"
            }`}
          >
            {t === "blog" ? "블로그" : "프로젝트"}
          </button>
        ))}
      </div>
      {tab === "blog" ? <BlogForm /> : <ProjectForm />}
    </div>
  )
}
