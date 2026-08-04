/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js는 워크스페이스 루트를 파일시스템에서 lockfile을 찾아 추정한다. 주변에 다른
  // lockfile(예: 실수로 놓인 pnpm-lock.yaml)이나 git worktree의 중복 package-lock.json이
  // 있으면 엉뚱한 디렉터리가 루트로 잡히고, 빌드 출력 파일 추적 범위가 환경마다 달라진다.
  // 이 파일이 있는 디렉터리가 곧 저장소 루트이므로 명시해 추정을 끈다.
  outputFileTracingRoot: __dirname,
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
  // 경로 개편에 따른 영구 이동. 기존 색인과 외부 유입 링크를 잃지 않기 위해 301로 보낸다.
  // permanent: true 가 301, false 면 308이 아니라 307/302 계열이 되어 검색엔진이
  // 이전 경로를 계속 색인한다.
  async redirects() {
    return [
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/projects/:id", destination: "/work/:id", permanent: true },
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
      { source: "/resume", destination: "/about/resume", permanent: true },
    ]
  },
}

module.exports = nextConfig
