import ResumeDoc from "../../../../components/resumeDoc"
import { getResume } from "../../../../lib/notionResume"

export const metadata = {
  title: "이력서 · 백엔드 개발자",
  description: "오세준(Sejune Oh) — C#/.NET 백엔드 개발자 정식 이력서",
}

/*
  내용을 **서버에서** 읽어 props 로 내린다 (#262 2단계).

  ResumeDoc 은 `"use client"` 다 — window.print() 를 쓰고 styled-jsx 로 그린다. 그래서
  컴포넌트 안에서 Notion 을 부를 수 없다(토큰이 클라이언트로 나가서는 안 된다).
  블로그 목록이 쓰는 것과 같은 모양이다: 서버가 페치하고 클라이언트는 그리기만 한다.

  getResume() 은 던지지 않는다 — 실패하면 lib/resumeData.ts 폴백을 돌려준다.
  그래서 이 페이지에 try/catch 가 없고, env 가 없는 로컬·프리뷰에서도 그대로 뜬다.
*/
export default async function Resume() {
  const { data } = await getResume()
  return <ResumeDoc data={data} />
}
