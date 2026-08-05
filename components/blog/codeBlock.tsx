import { codeToHtml } from "shiki"
import { notionToShiki } from "../../lib/codeLang"
import CopyButton from "./copyButton"

/*
  코드 블록: Shiki 서버 하이라이트(다크 단일 테마) + 복사 버튼.
  lang 은 Notion 코드블록 언어. 알 수 없으면 text(무채색)로 폴백한다.

  본문 여백·크기는 여기서 덮어쓴다. styles/globals.css 의 `.shiki` 규칙이
  padding 1rem / 13px / 1.6 을 걸고 있으므로 자식 선택자로 이 블록에만 다시 적용한다.

  라임은 코드 영역에 쓰지 않는다.
*/
export default async function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const shikiLang = notionToShiki(lang)

  /*
    vitesse-dark 를 쓴다. 채도가 낮아 계측 3채널색(--lime·--ch2·--ch3)과 경쟁하지 않는다.
    github-dark-default 는 파랑·자주가 강해 강조색과 부딪힌다.
  */
  const theme = "vitesse-dark"

  /*
    Shiki 는 테마 배경을 <pre> 의 인라인 style 로 넣는다. 인라인이 클래스 규칙을 이기므로
    CSS 로 덮으려면 !important 가 필요하다. 대신 테마 색을 치환해 토큰을 그대로 쓴다.

    vitesse-dark 의 배경은 #121212(중성 회색)이고 우리 판넬은 청색 계열이라 색조가 어긋난다.
    지면색(--bg)으로 바꿔 코드가 판보다 가라앉게 만든다 — 헤더 바는 --surface-hover 로 떠 있다.
  */
  const colorReplacements = { "#121212": "var(--bg)" }

  let html: string
  try {
    html = await codeToHtml(code, { lang: shikiLang, theme, colorReplacements })
  } catch {
    // 지원하지 않는 언어 등 → 무채색 text 로 폴백
    html = await codeToHtml(code, { lang: "text", theme, colorReplacements })
  }

  // 헤더에 낼 언어 표기. Notion 코드블록에 파일명이 없어 언어만 낸다.
  const label = shikiLang === "text" ? "" : shikiLang

  return (
    <div className="group relative mt-5 overflow-hidden rounded-[12px] border border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-hover px-4 py-2">
        <span className="eyebrow text-muted">{label}</span>
        <CopyButton code={code} />
      </div>
      <div
        className="[&_pre]:px-[18px] [&_pre]:py-[18px] [&_pre]:text-[13px] [&_pre]:leading-[1.75]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
