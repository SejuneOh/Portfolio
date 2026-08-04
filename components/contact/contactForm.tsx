"use client"

import { useActionState } from "react"
import Script from "next/script"
import { submitInquiry, type ContactState } from "../../app/(site)/contact/actions"

const INIT: ContactState = { ok: false, message: "" }

// Turnstile 사이트 키가 있을 때만 위젯 렌더(없으면 폼은 그대로 동작).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/*
  UI 옵션. 서버 액션이 lib/inquiries.ts 의 INQUIRY_TYPES 로 재검증하므로
  **값 문자열이 그 목록과 정확히 같아야 한다.** 목록에 없는 값을 보내면 서버가 조용히
  첫 항목으로 바꿔 저장하고 lint·build 는 통과한다 — 화면에서는 드러나지 않는다.
  서버 모듈을 client 로 끌어오지 않으려고 여기서 다시 적는다.

  표시 순서만 디자인에 맞춰 바꿨고 값은 그대로다. 기본 선택은 "면접 요청".
*/
const TYPES = ["면접 요청", "이메일 요청"] as const
const DEFAULT_TYPE: (typeof TYPES)[number] = "면접 요청"

const fieldCls =
  "mt-2 w-full rounded-[12px] border border-line bg-transparent px-[14px] py-3 text-sm text-ink placeholder:text-muted"

/*
  라벨은 규격이 10.5px 다. eyebrow 유틸(고정폭·대문자·자간)을 쓰되 크기만 덮는다 —
  같은 조합을 인라인으로 다시 복사하지 않기 위해서다. 10.5px 는 이 디자인의
  메타 텍스트 최소 크기이기도 하다.
*/
const labelCls = "eyebrow text-[10.5px] text-muted"

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitInquiry, INIT)

  return (
    <form action={action} className="mt-10 grid gap-6">
      {/* honeypot: 사람에겐 숨김, 봇이 채우면 스팸으로 처리. 서버가 name="company" 를 본다 */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          회사
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>이름 *</span>
          <input type="text" name="name" required className={fieldCls} placeholder="성함" />
        </label>
        <label className="block">
          <span className={labelCls}>이메일 *</span>
          <input
            type="email"
            name="email"
            required
            className={fieldCls}
            placeholder="you@example.com"
          />
        </label>
      </div>

      {/* 문의 유형 — select 가 아니라 필 라디오. 전송 필드는 여전히 name="type" 이다 */}
      <fieldset>
        <legend className={labelCls}>문의 유형</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t}
                defaultChecked={t === DEFAULT_TYPE}
                className="peer sr-only"
              />
              <span className="inline-flex items-center rounded-full border border-line px-4 py-1.5 text-[13.5px] text-ink transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:font-semibold peer-checked:text-[color:var(--lime-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className={labelCls}>메시지 *</span>
        <textarea
          name="message"
          rows={7}
          required
          className={fieldCls}
          placeholder="포지션이나 팀 소개를 자유롭게 적어주세요."
        />
      </label>

      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" />
        </>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2B22] disabled:opacity-50"
        >
          {pending ? "보내는 중…" : "문의 보내기 →"}
        </button>
        <span className="eyebrow text-muted">이메일로 회신드립니다</span>
      </div>

      {state.message && (
        <p
          className={`rounded-[12px] border px-[14px] py-3 text-sm ${
            state.ok ? "border-lime text-ink" : "border-line text-muted"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
