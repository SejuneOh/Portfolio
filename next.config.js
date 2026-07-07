/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Notion 커버는 호스트가 다양(app.notion.com, S3, unsplash 등)해 호스트 화이트리스트가
    // 계속 깨진다. 포트폴리오 규모에선 최적화보다 안정성이 중요하므로 최적화를 끄고
    // 어떤 원격 이미지든 그대로 서빙한다.
    unoptimized: true,
  },
}

module.exports = nextConfig
