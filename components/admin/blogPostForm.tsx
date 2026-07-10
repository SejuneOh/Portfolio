"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { saveBlogPost } from "../../app/admin/blog/actions"
import { Field, fieldCls, labelCls } from "./formFields"
import { useToast } from "./toast"

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
      const res = await saveBlogPost(formData)
      if (res.ok) {
        // 성공: 목록으로 이동 + 갱신. 입력값은 보존할 필요 없음(폼 이탈).
        show("success", res.message)
        router.push("/admin/blog")
        router.refresh()
        return // saving 유지(폼 언마운트)
      }
      // 검증/저장 실패: 토스트로 안내하고 폼에 머무름(입력 보존)
      show("error", res.message || "저장에 실패했습니다.")
    } catch {
      // 타임아웃(504)·네트워크 오류 등 예외: 에러 화면 대신 토스트로 처리하고 폼 유지
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
            disabled={saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "저장 중…" : isEdit ? "변경 저장" : "글 등록"}
          </button>
          <Link href="/admin/blog" className="link-underline text-sm text-muted">
            취소
          </Link>
        </div>
      </form>

      {/* 로딩 오버레이 — 저장 대기 중 폼을 덮고 스피너 표시 */}
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
