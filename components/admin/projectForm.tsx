"use client"

import { useActionState } from "react"
import { submitProject } from "../../app/admin/actions"
import { Field, Status, fieldCls, labelCls } from "./formFields"
import type { ActionState } from "../../lib/adminForm"

const INIT: ActionState = { ok: false, message: "" }

export default function ProjectForm() {
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
