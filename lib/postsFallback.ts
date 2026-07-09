import type { Post } from "./posts"

// Notion 블로그 DB 가 없거나(로컬/미설정) 조회가 비었을 때 사용하는 시드 글.
// 배열 앞쪽이 최신(내림차순).
export const fallbackPosts: Post[] = [
  {
    slug: "ef-core-cartesian-explosion",
    title: "EF Core 카테시안 폭발로 91초 걸리던 API를 0.04초로",
    date: "2026-07-06",
    category: "Performance",
    tags: ["EF Core", "C#", "Performance"],
    gradient: "from-[#2383e2] to-[#0b6bcb]",
    summary:
      "ProjectTo가 있는데도 남아 있던 Include가 만든 1.38억 row의 카테시안 폭발을 AsSplitQuery로 잡고, MD5로 응답 동일성까지 검증한 과정.",
    body: [
      { h: "증상: 1.38억 row의 카테시안 폭발" },
      { p: "병원 목록 API에서 프로덕션 SQL 타임아웃이 반복됐다. 특정 상세 엔드포인트 하나가 전체 장애의 절반을 차지했고, 응답까지 91초가 걸렸다. AutoMapper ProjectTo로 필요한 컬럼만 투영하고 있어 무거울 이유가 없어 보였는데, 실제 생성 SQL은 전혀 달랐다." },
      { p: "문제는 ProjectTo가 커버하는 프로젝션 위에 Include/ThenInclude 체인이 그대로 남아 있던 것. 여러 컬렉션을 한 쿼리로 조인하면서 행이 곱셈으로 폭발했다. COUNT_BIG으로 중간 물질화 행 수를 재보니 단일 쿼리가 약 1.38억 row를 만들고 있었다." },
      { code: "-- 컬렉션 4개가 한 쿼리에서 곱해지며 중간 행 폭발\nSELECT ... FROM Hospitals h\n  LEFT JOIN Departments ...\n  LEFT JOIN Doctors ...\n  LEFT JOIN Translations ...   -- N x M x K x ...\n=> 138,523,392 rows materialized" },
      { h: "해결: 불필요한 Include 제거 + 선택적 AsSplitQuery" },
      { p: "프로젝션이 이미 커버하는 Include는 제거하고, 깊은 컬렉션을 다루는 핸들러에만 AsSplitQuery()를 적용해 하나의 카테시안 쿼리를 여러 개의 작은 쿼리로 분리했다. 곱셈이 덧셈으로 바뀌면서 중간 행 수가 수천 단위로 떨어졌다." },
      { code: "var query = _db.Hospitals\n    .Where(predicate)\n    .AsSplitQuery()              // 곱집합 -> 분리 쿼리\n    .ProjectTo<HospitalDto>(_mapper.ConfigurationProvider);\n// Include/ThenInclude 는 ProjectTo 가 커버 -> 제거" },
      { h: "검증: MD5로 응답 동일성까지" },
      { p: "성능은 좋아졌지만 응답이 그대로인가가 더 중요했다. 최적화 전/후 응답 payload를 엔드포인트 7개 x 언어 5개 조합으로 뽑아 MD5가 바이트 단위로 동일한지 비교했다. 전부 일치 — 회귀 0." },
      { h: "결과" },
      { ul: [
        "v1 상세: 91초 → 0.04초",
        "v2 목록: 180초 타임아웃 → 0.26초",
        "중간 물질화 행: 약 1.38억 → 수천 단위",
        "응답 payload: MD5 동일(회귀 0)",
      ] },
      { p: "ProjectTo를 쓴다고 Include가 자동으로 무해해지지 않는다. 그리고 빨라졌다는 항상 결과가 같다와 함께 증명해야 신뢰할 수 있다 — 생성 SQL과 payload 해시를 같이 보는 습관이 결정적이었다." },
    ],
  },
  {
    slug: "polly-http-resilience",
    title: "Polly로 HTTP 복원력 계층 만들기 — 333건 장애 대응기",
    date: "2026-06-20",
    category: "Backend",
    tags: ["Polly", ".NET", "Resilience"],
    gradient: "from-[#0f9d8f] to-[#0a544c]",
    summary:
      "전이성(transient) 네트워크·5xx 실패로 쌓인 333건의 자동 리포트를, 지수 백오프 재시도와 토큰 캐싱으로 구조적으로 줄인 이야기.",
    body: [
      { h: "문제" },
      { p: "HttpRequestException이 자동 리포트로 333건 쌓여 있었다. 대부분 일시적인 네트워크·5xx·토큰 발급 타임아웃이었는데, 재시도 정책이 없어 한 번 실패하면 그대로 장애로 기록됐다." },
      { h: "해결" },
      { p: "Microsoft.Extensions.Http.Polly로 솔루션 전반에 복원력 계층을 도입했다. 5xx·408·429·TaskCanceledException에 대해 지수 백오프(2→4→8초, 3회) 재시도를 걸고, Revalidate/AI 호출의 과도한 타임아웃을 30~60초로 조였다." },
      { code: "services.AddHttpClient(\"revalidate\")\n  .AddTransientHttpErrorPolicy(p =>\n    p.WaitAndRetryAsync(3, r => TimeSpan.FromSeconds(Math.Pow(2, r))));" },
      { p: "추가로 Azure AD 토큰을 Singleton 캐시(SemaphoreSlim double-check)로 감싸 배치당 N회 발급을 1회로 줄였고, 실패를 성공으로 기록하던 silent-failure 안티패턴을 제거해 실제 실패가 재시도 큐로 올라오게 했다." },
    ],
  },
  {
    slug: "cosmos-server-side-query",
    title: "Cosmos DB 클라이언트측 → 서버측 쿼리 마이그레이션",
    date: "2026-05-30",
    category: "Performance",
    tags: ["Cosmos DB", "Query", "C#"],
    gradient: "from-[#8e5cf7] to-[#5b32b0]",
    summary:
      "메모리로 다 끌어와 필터링하던 채팅 세션 조회를 서버측 쿼리로 옮겨 RU와 지연을 줄인 과정.",
    body: [
      { h: "문제" },
      { p: "채팅 세션 조회가 파티션의 문서를 클라이언트로 모두 가져온 뒤 메모리에서 필터링하고 있었다. 세션이 쌓일수록 RU 소비와 지연이 선형으로 늘었다." },
      { h: "해결" },
      { p: "필터·정렬을 서버측 SQL 쿼리로 내려 필요한 문서만 받도록 바꾸고, 파티션 키를 쿼리에 명시해 크로스 파티션 팬아웃을 피했다. 페이지네이션은 continuation token 기반으로 정리했다." },
      { p: "핵심은 '가져와서 거르기'가 아니라 '거른 걸 가져오기'. 데이터가 커질수록 이 차이가 비용·지연으로 그대로 드러난다." },
    ],
  },
  {
    slug: "signalr-crossorigin-jwt",
    title: "SignalR 크로스오리진 JWT 인증 삽질기",
    date: "2026-05-15",
    category: "Backend",
    tags: ["SignalR", "JWT", "CORS"],
    gradient: "from-[#e0685f] to-[#b23b32]",
    summary:
      "WebSocket 업그레이드에서 토큰이 안 실려 허브 연결이 실패하던 문제를, CORS·쿼리스트링 토큰·클라이언트 팩토리 3박자로 해결.",
    body: [
      { h: "문제" },
      { p: "프로덕션에서 SignalR 허브 연결이 간헐적으로 실패했다. WebSocket 업그레이드 요청에는 Authorization 헤더가 실리지 않아 서버가 인증을 못 했고, 크로스오리진 자격증명도 막혀 있었다." },
      { h: "해결 3박자" },
      { ul: [
        "CORS: AllowCredentials + SetIsOriginAllowed 로 자격증명 허용",
        "서버: JwtBearer OnMessageReceived 에서 access_token 쿼리스트링을 읽어 인증",
        "클라이언트: accessTokenFactory 로 토큰을 연결마다 주입",
      ] },
      { code: "options.Events = new JwtBearerEvents {\n  OnMessageReceived = ctx => {\n    var token = ctx.Request.Query[\"access_token\"];\n    if (!string.IsNullOrEmpty(token)) ctx.Token = token;\n    return Task.CompletedTask;\n  }\n};" },
      { p: "셋 중 하나만 빠져도 조용히 실패한다. WebSocket 인증은 HTTP 인증과 경로가 다르다는 걸 체감한 사례." },
    ],
  },
]
