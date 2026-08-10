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
  /*
    지면 대비 AA(4.5:1)를 넘지 못하는 토큰색을 치환한다.
    vitesse-dark 는 자기 배경 #121212 를 기준으로 만들어졌고, 이 일곱은 거기서도 여유가 없었다.

    **테마를 정본으로 센다.** #224 는 내가 훑은 글 7개·케이스 10개에 실제로 나타난
    토큰만 세서 3개만 고쳤다. 그 17개에 없던 스코프는 보이지 않았고, 승격 뒤 프로덕션에서
    property-name 따옴표가 2.61:1 로 잡혔다 (#246). 렌더 결과가 아니라 정의를 세야 했다.

    scripts/test-shiki-contrast.mjs 가 테마의 토큰색 전부를 재고 미달이 남으면 실패한다.
    CI 가 매 PR 에서 돌린다 — 이 목록이 다시 뒤처지지 않게 하는 장치다.

      #24292e     1.35:1   carriage-return
      #2f363d     1.61:1   markup.ignored, markup.untracked
      #c98a7d77   2.33:1   punctuation.definition.string
      #b8a96577   2.61:1   punctuation.support.type.property-name   ← 프로덕션에서 잡힌 것
      #666666     3.44:1   delimiter, keyword.operator
      #758575dd   4.04:1   comment
      #6872ab     4.31:1   type.identifier, regexp character-class

    색상(hue)과 채도는 바꾸지 않는다 — 색을 갈면 테마의 색 관계가 무너진다.
    vitesse-dark 는 '가라앉히기'를 알파로 하므로 알파를 먼저 올리고, 알파 1.0 으로도
    모자란 것만 명도를 올렸다. 목표는 반올림 여유를 둬 4.6:1.
  */
  const colorReplacements = {
    "#121212": "var(--bg)",
    "#24292e": "#6d7c8b",
    "#2f363d": "#6c7c8c",
    "#c98a7d77": "#c98a7dc8",
    "#b8a96577": "#b8a965b4",
    "#666666": "#7a7a7a",
    "#758575dd": "#758575f1",
    "#6872ab": "#6d77ae",
  }

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
    <div className="group relative mt-5 overflow-hidden rounded-[3px] border border-line">
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
