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
  // 경로 개편에 따른 영구 이동. 기존 색인과 외부 유입 링크를 잃지 않기 위해 보낸다.
  //
  // `permanent: true` 는 301이 아니라 **308**을 내보낸다. 두 이슈가 모두 301을
  // 요구하므로 statusCode 를 직접 지정한다. permanent 와 statusCode 는 함께 쓸 수 없다.
  // (308도 영구 이동이지만 메서드를 보존한다는 점이 다르고, 요구된 값은 301이다.)
  async redirects() {
    return [
      { source: "/projects", destination: "/work", statusCode: 301 },
      { source: "/projects/:id", destination: "/work/:id", statusCode: 301 },
      { source: "/blog", destination: "/writing", statusCode: 301 },
      { source: "/blog/:slug", destination: "/writing/:slug", statusCode: 301 },
      { source: "/resume", destination: "/about/resume", statusCode: 301 },
    ]
  },
}

module.exports = nextConfig
