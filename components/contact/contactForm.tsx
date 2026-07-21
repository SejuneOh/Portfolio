"use client"

import { useActionState } from "react"
import Script from "next/script"
import { submitInquiry, type ContactState } from "../../app/(site)/contact/actions"

const INIT: ContactState = { ok: false, message: "" }

// Turnstile 사이트 키가 있을 때만 위젯 렌더(없으면 폼은 그대로 동작).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

// UI 옵션(서버 액션이 INQUIRY_TYPES 로 재검증). 서버 모듈을 client 로 끌어오지 않도록 여기서 정의.
const TYPES = ["이메일 요청", "면접 요청"] as const

const fieldCls =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
const labelCls = "block text-xs font-medium uppercase tracking-wide text-muted"

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitInquiry, INIT)

  return (
    <form action={action} className="mt-8 grid gap-4">
      {/* honeypot: 사람에겐 숨김, 봇이 채우면 스팸으로 처리 */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          회사
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>이름 *</span>
          <input type="text" name="name" required className={fieldCls} placeholder="성함" />
        </label>
        <label className="block">
          <span className={labelCls}>이메일 *</span>
          <input type="email" name="email" required className={fieldCls} placeholder="you@example.com" />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>문의 유형</span>
        <select name="type" className={fieldCls} defaultValue={TYPES[0]}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelCls}>메시지 *</span>
        <textarea name="message" rows={6} required className={fieldCls} placeholder="문의 내용을 남겨주세요." />
      </label>

      {TURNSTILE_SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
          />
          <div
            className="cf-turnstile"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-theme="auto"
          />
        </>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "보내는 중…" : "문의 보내기"}
        </button>
      </div>

      {state.message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            state.ok ? "bg-accent/10 text-accent" : "border border-line text-muted"
          }`}
          role="status"
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
