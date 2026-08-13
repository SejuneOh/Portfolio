export const DATABASE_ID = process.env.NOTION_DB
export const TOKEN = process.env.NOTION_TOKEN

// 블로그 콘텐츠용 Notion 데이터베이스 (PR-B: 읽기 / PR-C: 쓰기)
export const BLOG_DATABASE_ID = process.env.NOTION_BLOG_DB

// 공개 문의(이메일·면접 요청) 저장용 Notion 데이터베이스 (PR-D)
export const INQUIRIES_DATABASE_ID = process.env.NOTION_INQUIRIES_DB

// 이력서 저장용 Notion 데이터베이스 (#262 2단계).
// 행 하나에 이력서 전체가 들어가고, 내용은 **페이지 본문의 코드 블록**에 JSON 으로 있다
// (속성이 아니다 — rich_text 는 항목당 2000자라 긴 JSON 이 안 들어간다).
// 없으면 lib/resumeData.ts 폴백으로 돈다. 자세한 것은 lib/notionResume.ts 머리 주석.
export const RESUME_DATABASE_ID = process.env.NOTION_RESUME_DB