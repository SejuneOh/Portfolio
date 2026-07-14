// 사이트 전역 상수 (SEO·메타데이터·구조화 데이터 공용).
// 커스텀 도메인 사용 시 NEXT_PUBLIC_SITE_URL 로 덮어쓴다.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-iota-eight-99.vercel.app"
).replace(/\/$/, "")

export const SITE_NAME = "Sejune Oh"
export const SITE_TITLE = "Sejune Oh — 백엔드 개발자"
export const SITE_DESCRIPTION =
  "헬스케어 SaaS의 채팅/메시징 백엔드를 설계·운영하는 C#/.NET 백엔드 개발자 오세준의 포트폴리오"

// schema.org Person / 소셜 링크
export const AUTHOR = {
  name: "Sejune Oh",
  alternateName: "오세준",
  jobTitle: "Backend Engineer",
  sameAs: ["https://github.com/SejuneOh"],
}
