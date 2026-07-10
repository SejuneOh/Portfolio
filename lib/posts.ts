// 블로그 도메인 타입 + 순수 유틸.
// 이 모듈은 서버 전용 fetch 를 포함하지 않으므로 client 컴포넌트에서도 안전하게 import 가능하다.
// 실제 데이터 조회(Notion)는 lib/postsData.ts 참고.
// body 블록: { p } 문단, { h } 소제목, { code } 코드, { ul } 목록

export type Block =
  | { p: string; h?: never; code?: never; ul?: never }
  | { h: string; p?: never; code?: never; ul?: never }
  | { code: string; p?: never; h?: never; ul?: never }
  | { ul: string[]; p?: never; h?: never; code?: never }

export interface Post {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  // 과거 카드 디자인용 그라디언트. 현재 렌더에는 미사용이라 선택값.
  gradient?: string
  summary: string
  body: Block[]
}

// 본문 글자 수 기반 읽기시간(분). 한국어 ~500자/분 기준.
export function readingMinutes(post: Post): number {
  const text = (post.body || [])
    .map((b) => b.p || b.h || b.code || (b.ul ? b.ul.join(" ") : ""))
    .join(" ")
  return Math.max(1, Math.round(text.replace(/\s/g, "").length / 500))
}

// 글 목록에서 카테고리 탭 목록을 만든다: ["All", ...등장 순서 고유 카테고리]
export function deriveCategories(posts: Post[]): string[] {
  const seen: string[] = []
  for (const p of posts) {
    if (p.category && !seen.includes(p.category)) seen.push(p.category)
  }
  return ["All", ...seen]
}
