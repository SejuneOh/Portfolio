"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { saveResumeAction } from "../../app/admin/resume/actions"
import type { ResumeData } from "../../lib/resumeData"
import { encodeResume } from "../../lib/resumeText"
import { Field, fieldCls, labelCls } from "./formFields"
import { useToast } from "./toast"

/*
  이력서 편집 폼 (#262 3단계).

  ## 여는 것과 잠근 것

  **잠금(코드 소유)** — 섹션 구성과 순서, 연도 칸 정렬, 강조는 항목당 하나, 칩은 측정값 전용,
  A4 인쇄 조판. 이 폼에는 그것을 바꿀 입력칸이 없다. 내용이 임의로 늘면 인쇄가 조용히
  3쪽이 되고(#226 이 2쪽에 맞춘 것), 강조를 여럿 달면 #256 이 없앤 문제가 돌아온다.

  **여는 것** — 머리말·지표 3개·핵심 역량·경력·사이드·학력의 글자.

  ## 왜 반복되는 부분이 글상자인가

  스킬 6행, 경력의 3단 중첩, 학력 3항목을 전부 개별 칸으로 만들면 칸이 백 개 넘게 생기고
  행 추가·삭제 버튼까지 붙어야 한다. 한 줄이 한 항목인 글상자를 쓰면 줄을 지우면 항목이
  사라지고 줄을 더하면 생긴다. 문법과 파싱은 lib/resumeText.ts 에 있고 **줄 번호와 함께**
  문제를 돌려준다.

  지표 띠만 개별 칸이다 — 값·앞·뒤가 섞여 한 줄로 적으면 규칙이 마술처럼 된다.
*/

const HELP = "font-normal normal-case tracking-normal text-muted/80"

function Area({
  label,
  hint,
  name,
  rows,
  defaultValue,
  placeholder,
}: {
  label: string
  hint: string
  name: string
  rows: number
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label} <span className={HELP}>— {hint}</span>
      </span>
      <textarea
        name={name}
        rows={rows}
        className={`${fieldCls} font-mono text-[13px] leading-relaxed`}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </label>
  )
}

export default function ResumeForm({ data, source }: { data: ResumeData; source: string }) {
  const router = useRouter()
  const { show, node } = useToast()
  const [saving, setSaving] = useState(false)
  const text = encodeResume(data)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (saving) return
    const formData = new FormData(e.currentTarget)
    setSaving(true)
    try {
      const res = await saveResumeAction(formData)
      show(res.ok ? "success" : "error", res.message || "저장에 실패했습니다.")
      if (res.ok) router.refresh()
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
      {/*
        지금 무엇을 고치고 있는지 알려 준다. 폴백 상태에서 저장하면 코드 폴백 내용이
        Notion 으로 올라가는 셈이라, 그 사실을 모르고 저장하면 놀라게 된다.
      */}
      <p className="mb-4 rounded-md border border-line px-3 py-2 text-xs text-muted">
        {source === "notion"
          ? "Notion 에서 읽은 내용입니다. 저장하면 Notion 이 갱신되고 화면이 즉시 반영됩니다."
          : `아직 Notion 에서 읽지 못했습니다 (${source}). 아래는 코드 폴백 내용이며, 저장하면 이 내용이 Notion 에 처음 기록됩니다.`}
      </p>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <fieldset className="grid gap-4">
          <legend className={labelCls}>머리말</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="아이브로우" name="eyebrow" required defaultValue={data.header.eyebrow} />
            <Field label="이름" name="name" required defaultValue={data.header.name} />
          </div>
          <Field label="이름 아래 한 줄" name="nameSub" required defaultValue={data.header.nameSub} />
          <label className="block">
            <span className={labelCls}>
              소개 문단{" "}
              <span className={HELP}>— 굵은 강조도 수치도 쓰지 않는다 (#256)</span>
            </span>
            <textarea
              name="tagline"
              rows={3}
              className={fieldCls}
              defaultValue={data.header.tagline}
            />
          </label>
          <Area
            label="연락처"
            hint="한 줄에 하나 · `글자 | 주소(선택)`"
            name="contacts"
            rows={3}
            defaultValue={text.contacts}
            placeholder={"etry0715@gmail.com | mailto:etry0715@gmail.com\n경력 7년 6개월"}
          />
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className={labelCls}>
            지표 띠 <span className={HELP}>— 3열 격자라 개수는 3개로 고정</span>
          </legend>
          {[0, 1, 2].map((i) => {
            const m = data.metrics[i]
            return (
              <div key={i} className="grid gap-3 rounded-md border border-line p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label={`${i + 1}. 앞 (흐리게)`} name={`metric${i}From`} defaultValue={m?.from} />
                  <Field label="값" name={`metric${i}Value`} required defaultValue={m?.value} />
                  <Field label="뒤 (흐리게)" name={`metric${i}After`} defaultValue={m?.after} />
                </div>
                <div className="flex flex-wrap gap-5 text-xs text-muted">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name={`metric${i}Arrow`} defaultChecked={m?.arrow} />
                    앞과 값 사이에 화살표
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={`metric${i}AfterSmall`}
                      defaultChecked={m?.afterSmall}
                    />
                    뒤를 더 작게 (% 같은 단위)
                  </label>
                </div>
                <Area
                  label="설명"
                  hint="한 줄 또는 두 줄"
                  name={`metric${i}Label`}
                  rows={2}
                  defaultValue={(m?.label || []).join("\n")}
                />
              </div>
            )
          })}
        </fieldset>

        <Area
          label="핵심 역량"
          hint="한 줄에 하나 · `그룹 | 주로 쓰는 것 | 함께 쓰는 것(선택)`"
          name="skills"
          rows={8}
          defaultValue={text.skills}
        />

        <Area
          label="경력"
          hint="`## 회사 | 기간 | 역할` · `# 프로젝트 | 기간 | 설명` · `- 연도 | 항목` (이름 앞 ◆ 는 별표)"
          name="career"
          rows={20}
          defaultValue={text.career}
          placeholder={
            "## 회사 | 2023.02 – 재직중 · 정규직 | 역할 한 줄\n" +
            "# ◆ 프로젝트 이름 | · 2024~현재 | 설명 한 줄\n" +
            "- 2024 | 무엇을 해서 **어떤 결과**가 났다\n" +
            "- | 연도를 모르면 비운다"
          }
        />

        <Area
          label="사이드 프로젝트"
          hint="한 줄에 하나 · 본문 표기 그대로"
          name="side"
          rows={4}
          defaultValue={text.side}
        />

        <Area
          label="학력 · 교육"
          hint="한 줄에 하나 · `이름 | 기간 | 설명(선택)`"
          name="education"
          rows={4}
          defaultValue={text.education}
        />

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className={labelCls}>문서 하단</legend>
          <Field label="왼쪽" name="footerLeft" required defaultValue={data.footer[0]} />
          <Field label="오른쪽" name="footerRight" required defaultValue={data.footer[1]} />
        </fieldset>

        <p className="text-xs text-muted">
          강조 표기 — <code>**결과**</code> 는 굵게(항목당 하나), <code>`194 → 3ms`</code> 는
          측정값 칩입니다. 기술 이름에는 둘 다 쓰지 않습니다.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-lime px-4 py-2 text-sm font-medium text-[color:var(--lime-ink)] transition-colors hover:bg-[#CDEA55] disabled:opacity-50"
          >
            {saving ? "저장 중…" : "이력서 저장"}
          </button>
          <Link href="/about/resume" className="link-underline text-sm text-muted">
            이력서 화면 보기
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
