/*
  프로젝트 기간 표기를 한 곳에서 만든다.

  Notion 의 날짜 속성은 `2024-09-01`, 수동 입력값은 `2024.09` 처럼 섞여 들어온다.
  화면마다 각자 변환하면 같은 프로젝트가 화면에 따라 `2024-09-01`·`2024.09` 로
  달리 보인다. 실제로 이 함수가 두 파일에 똑같이 복사돼 있었고 홈은 변환 없이
  원본을 출력하고 있었다.
*/

// "2024-09-01" / "2024.09" → "2024.09"
export function fmtMonth(d?: string): string {
  if (!d) return ""
  const [y, m] = d.replace(/\./g, "-").split("-")
  return m ? `${y}.${m}` : y
}

/*
  기간 문자열. 진행 중이면 끝을 "현재" 로 둔다.
  빈 값은 걸러낸다 — 그러지 않으면 `2024.09 — ` 처럼 구분자만 남는다.
*/
export function periodLabel(start?: string, end?: string, ongoing?: boolean): string {
  return [fmtMonth(start), ongoing ? "현재" : fmtMonth(end)].filter(Boolean).join(" — ")
}
