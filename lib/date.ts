/*
  프로젝트 기간 표기를 한 곳에서 만든다.

  Notion 의 날짜 속성은 `2024-09-01`, 수동 입력값은 `2024.09` 처럼 섞여 들어온다.
  화면마다 각자 변환하면 같은 프로젝트가 화면에 따라 `2024-09-01`·`2024.09` 로
  달리 보인다. 실제로 이 함수가 두 파일에 똑같이 복사돼 있었고 홈은 변환 없이
  원본을 출력하고 있었다.
*/

/*
  들어오는 값을 [연, 월, 일] 로 쪼갠다.

  Notion 날짜 속성에 「시간 포함」이 켜지면 `2026-08-06T09:00:00.000+09:00` 을 준다.
  앞 10글자만 떼어 그 경우를 먼저 없앤다 — 그러지 않으면 일 자리에 시각이 붙어
  `2026.08.06T09:00:00` 이 된다.

  fmtMonth 는 앞 두 조각만 쓰기 때문에 시간 포함 값에서도 **우연히** 무사했다.
  우연에 의존하지 않도록 정규화를 한 곳으로 모은다.
*/
function parts(d: string): string[] {
  return d.slice(0, 10).replace(/\./g, "-").split("-")
}

// "2024-09-01" / "2024.09" → "2024.09"
export function fmtMonth(d?: string): string {
  if (!d) return ""
  const [y, m] = parts(d)
  return m ? `${y}.${m}` : y
}

/*
  일까지 낸다. "2026-08-06" → "2026.08.06"

  글 날짜에 쓴다. 홈 로그 축은 케이스 기간(periodLabel)과 글 날짜를 같은 칸에 번갈아
  내므로 어법이 같아야 하는데, fmtMonth 를 쓰면 같은 달의 글 둘이 같은 라벨로 보인다.
  어법(점 구분)은 유지하고 정밀도만 되찾는다.

  fmtMonth 와 같은 정규화(`.` → `-`)를 쓴다. 일이 없는 입력(`2026-08`·`2026.08`)은
  fmtMonth 와 같은 결과를 낸다 — 빈 칸이 되면 안 된다.

  케이스 기간은 그대로 fmtMonth 다. 몇 년에 걸친 기간에 일까지 붙일 이유가 없다.
*/
export function fmtDay(d?: string): string {
  if (!d) return ""
  const [y, m, day] = parts(d)
  if (!m) return y
  return day ? `${y}.${m}.${day}` : `${y}.${m}`
}

/*
  기간 문자열. 진행 중이면 끝을 "현재" 로 둔다.
  빈 값은 걸러낸다 — 그러지 않으면 `2024.09 — ` 처럼 구분자만 남는다.
*/
export function periodLabel(start?: string, end?: string, ongoing?: boolean): string {
  return [fmtMonth(start), ongoing ? "현재" : fmtMonth(end)].filter(Boolean).join(" — ")
}
