"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveProject } from "../../app/admin/actions"
import { Field, fieldCls, labelCls } from "./formFields"
import { useToast } from "./toast"

export interface ProjectFormInitial {
  id?: string
  name?: string
  description?: string
  tags?: string
  github?: string
  startDate?: string
  endDate?: string
  status?: string
  impact?: string
  role?: string
  teamSize?: string
  liveUrl?: string
  group?: string
  groupSummary?: string
  cover?: string
  body?: string
}

export default function ProjectForm({ initial = {} }: { initial?: ProjectFormInitial }) {
  const isEdit = Boolean(initial.id)
  const router = useRouter()
  const { show, node } = useToast()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return
    const formData = new FormData(e.currentTarget)
    setSaving(true)
    try {
      const res = await saveProject(formData)
      if (res.ok) {
        show("success", res.message)
        router.push("/admin/projects")
        router.refresh()
        return // saving 유지(폼 언마운트)
      }
      show("error", res.message || "저장에 실패했습니다.")
    } catch {
      show(
        "error",
        "저장에 실패했습니다. 시간 초과 또는 네트워크 오류일 수 있어요. 잠시 후 다시 시도해주세요."
      )
    }
    setSaving(false)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="grid gap-4">
        {isEdit && <input type="hidden" name="id" value={initial.id} />}
        {isEdit && <input type="hidden" name="originalBody" value={initial.body ?? ""} />}

        <Field label="프로젝트명(경험)" name="name" placeholder="예: 멀티플랫폼 메시징 백엔드" required defaultValue={initial.name} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="대분류 그룹 (group)" name="group" placeholder="예: Omni 메시징 백엔드 (비우면 단독 프로젝트)" defaultValue={initial.group} />
          <Field label="라이브 URL" name="liveUrl" placeholder="https://…" defaultValue={initial.liveUrl} />
        </div>

        <label className="block">
          <span className={labelCls}>설명 (목록 카드 요약)</span>
          <textarea name="description" rows={2} className={fieldCls} placeholder="한두 문장 요약" defaultValue={initial.description} />
        </label>

        <label className="block">
          <span className={labelCls}>그룹 요약 (groupSummary · 대분류 상세 상단)</span>
          <textarea name="groupSummary" rows={2} className={fieldCls} placeholder="같은 그룹의 여러 경험을 아우르는 요약" defaultValue={initial.groupSummary} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="역할 (role)" name="role" placeholder="예: 백엔드 오너십" defaultValue={initial.role} />
          <Field label="팀 규모 (teamSize)" name="teamSize" placeholder="예: 4명" defaultValue={initial.teamSize} />
        </div>

        <label className="block">
          <span className={labelCls}>임팩트 (impact · 성과 지표)</span>
          <textarea name="impact" rows={2} className={fieldCls} placeholder="예: p95 응답 320ms→90ms" defaultValue={initial.impact} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="태그 (쉼표로 구분)" name="tags" placeholder="C#, .NET, Azure" defaultValue={initial.tags} />
          <Field label="GitHub / 저장소" name="github" placeholder="https://github.com/…" defaultValue={initial.github} />
        </div>

        <Field label="커버 이미지 URL" name="cover" placeholder="https://… (비우면 해치 패턴 폴백)" defaultValue={initial.cover} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="시작일" name="startDate" type="date" defaultValue={initial.startDate} />
          <Field label="종료일" name="endDate" type="date" defaultValue={initial.endDate} />
          <Field label="상태 (status 옵션명)" name="status" placeholder="Done / In progress" defaultValue={initial.status} />
        </div>

        <label className="block">
          <span className={labelCls}>본문 (마크다운 유사: # 제목, ``` 코드, - 목록)</span>
          <textarea
            name="body"
            rows={12}
            className={`${fieldCls} font-mono`}
            placeholder={"## 배경\n문단 내용...\n\n- 핵심 기여\n\n```\n코드\n```"}
            defaultValue={initial.body}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "저장 중…" : isEdit ? "변경 저장" : "프로젝트 등록"}
          </button>
          <Link href="/admin/projects" className="link-underline text-sm text-muted">
            취소
          </Link>
        </div>
      </form>

      {saving && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-page/70 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
            저장 중…
          </div>
        </div>
      )}

      {node}
    </div>
  )
}
