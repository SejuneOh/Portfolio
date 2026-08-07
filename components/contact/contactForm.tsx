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

/*
  필드 경계는 --control-border(구 --field-border) 를 쓴다. --border 는 지면 대비 1.38:1 이라
  어두운 지면에서 필드가 어디부터 어디까지인지 보이지 않는다 (WCAG 1.4.11 비텍스트 3:1 미달).
  #229 에서 같은 토큰을 필터 칩·아웃라인 버튼·복사 버튼까지 넓히면서 이름을 바꿨다.

  포커스는 전역 :focus-visible 이 라임 외곽선을 그린다(globals.css). 여기서는 경계색까지
  라임으로 올려 신호를 둘로 만든다 — :focus-visible 이 아니라 :focus 를 쓰는 이유는
  텍스트 입력은 마우스로 눌러 들어와도 "지금 여기 쓴다"가 보여야 하기 때문이다.
*/
const fieldCls =
  "mt-2 w-full rounded-[3px] border border-control bg-transparent px-[14px] py-3 text-sm text-ink transition-colors placeholder:text-muted hover:border-ink focus:border-lime"

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

      {/* 문의 유형 — select 가 아니라 라디오 칩. 전송 필드는 여전히 name="type" 이다 */}
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
              {/* 포커스 외곽선은 전역과 같은 라임으로 맞춘다 — 한 폼에 포커스색이 둘이면 안 된다 */}
              <span className="inline-flex items-center rounded-[3px] border border-control px-4 py-1.5 text-[13.5px] text-ink transition-colors peer-checked:border-lime peer-checked:bg-lime peer-checked:font-semibold peer-checked:text-[color:var(--lime-ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime">
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
        {/*
          비활성은 opacity 로 흐리게 하지 않는다 — 어두운 지면에서 반투명 라임은
          그냥 어두운 라임으로 보여 "누를 수 있는 버튼"과 구분되지 않는다.
          채움을 비우고 아웃라인으로 내려 형태 자체를 바꾼다. 글자는 --text-muted
          (지면 대비 5.88:1)라 "보내는 중…"이 여전히 읽힌다.

          테두리를 평상시에도 투명으로 깔아 둔다. 비활성일 때만 border 를 붙이면
          그 순간 1px 씩 커져서 옆의 안내 문구가 밀린다.
        */}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-[3px] border border-transparent bg-lime px-5 py-2.5 text-sm font-semibold text-[color:var(--lime-ink)] transition-colors hover:bg-[#CDEA55] disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-muted"
        >
          {pending ? "보내는 중…" : "문의 보내기 →"}
        </button>
        <span className="eyebrow text-muted">이메일로 회신드립니다</span>
      </div>

      {/*
        결과 알림. 이전에는 실패가 border-line + text-muted 였다 — 평상시 테두리와
        같은 색이라 오류가 오류로 보이지 않았다. 실패는 --danger(빨강)로 낸다.
        라임은 성공에만 쓴다. 강조색과 오류색이 같으면 둘을 구별할 수 없다.

        색 하나에 의존하지 않는다(WCAG 1.4.1). 표식(사각/삼각)과 role 이 함께 갈린다 —
        실패는 role="alert" 로 즉시 읽히고, 성공은 role="status" 로 순서를 기다린다.
      */}
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`flex items-start gap-2.5 rounded-[3px] border px-[14px] py-3 text-sm ${
            state.ok
              ? "border-lime text-ink"
              : "border-[color:var(--danger)] text-[color:var(--danger)]"
          }`}
        >
          <span aria-hidden className="mt-[3px] shrink-0 leading-none">
            {state.ok ? "■" : "▲"}
          </span>
          <span className="min-w-0">{state.message}</span>
        </p>
      )}
    </form>
  )
}
