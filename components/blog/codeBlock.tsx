import { codeToHtml } from "shiki"
import { notionToShiki } from "../../lib/codeLang"
import CopyButton from "./copyButton"

/*
  코드 블록: Shiki 서버 하이라이트(라이트 단일 테마) + 복사 버튼.
  lang 은 Notion 코드블록 언어. 알 수 없으면 text(무채색)로 폴백한다.

  본문 여백·크기는 여기서 덮어쓴다. styles/globals.css 의 `.shiki` 규칙이
  padding 1rem / 13px / 1.6 을 걸고 있는데, 그 파일은 이 작업의 변경 대상이
  아니라서 자식 선택자로 이 블록에만 적용한다.

  라임은 코드 영역에 쓰지 않는다.
*/
export default async function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const shikiLang = notionToShiki(lang)
  const theme = "github-light"
  let html: string
  try {
    html = await codeToHtml(code, { lang: shikiLang, theme })
  } catch {
    // 지원하지 않는 언어 등 → 무채색 text 로 폴백
    html = await codeToHtml(code, { lang: "text", theme })
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
