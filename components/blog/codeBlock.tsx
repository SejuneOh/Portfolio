import { codeToHtml } from "shiki"
import { notionToShiki } from "../../lib/codeLang"
import CopyButton from "./copyButton"

/* 코드 블록: Shiki 서버 하이라이트(라이트 단일 테마) + 복사 버튼.
   lang 은 Notion 코드블록 언어. 알 수 없으면 text(무채색)로 폴백. */
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

  return (
    <div className="group relative mt-5 overflow-hidden rounded-lg border border-line">
      <CopyButton code={code} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
