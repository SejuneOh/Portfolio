import { NextResponse, type NextRequest } from "next/server"
import { revalidatePath } from "next/cache"

// Notion(CMS) 수정 후 목록·상세·홈을 재배포 없이 즉시 갱신하는 on-demand revalidation.
//   호출 예:
//     POST /api/revalidate?secret=XXX                 → 기본 경로 일괄 갱신
//     POST /api/revalidate?secret=XXX&path=/projects/omni  → 특정 경로만 갱신(반복 가능)
// 시크릿은 ?secret= 쿼리 또는 x-revalidate-secret 헤더로 전달한다.

export const dynamic = "force-dynamic"

// 콘텐츠 변경 시 함께 갱신할 기본 경로 + 동적 라우트 패턴.
const DEFAULTS: Array<[string] | [string, "page" | "layout"]> = [
  ["/"],
  ["/projects"],
  ["/projects/[id]", "page"],
  ["/blog"],
  ["/blog/[slug]", "page"],
]

function handle(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET 미설정" },
      { status: 500 },
    )
  }

  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("x-revalidate-secret")
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const requested = req.nextUrl.searchParams.getAll("path").filter(Boolean)
  let revalidated: string[]
  if (requested.length > 0) {
    // 지정 경로만 정밀 갱신(예: 수정된 프로젝트/글 상세).
    requested.forEach((p) => revalidatePath(p))
    revalidated = requested
  } else {
    // 미지정 시 콘텐츠 목록/홈/동적 상세를 일괄 갱신.
    DEFAULTS.forEach(([p, type]) =>
      type ? revalidatePath(p, type) : revalidatePath(p),
    )
    revalidated = DEFAULTS.map(([p]) => p)
  }

  return NextResponse.json({ ok: true, revalidated })
}

export async function POST(req: NextRequest) {
  return handle(req)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
