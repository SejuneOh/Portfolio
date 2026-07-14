/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Notion 커버는 S3(prod-files-secure.s3.*.amazonaws.com)·notion.so·unsplash 등에서 온다.
    // 넓은 패턴으로 최적화를 켜되, 목록 밖 호스트 이미지는 개별 컴포넌트에서 `unoptimized`
    // 로 폴백한다(호스트 churn 시 빌드가 아니라 해당 이미지만 영향).
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.notion.so" },
      { protocol: "https", hostname: "**.notion.site" },
      { protocol: "https", hostname: "**.unsplash.com" },
    ],
  },
}

module.exports = nextConfig
