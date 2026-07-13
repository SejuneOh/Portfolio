// schema.org 구조화 데이터(JSON-LD)를 <script>로 주입하는 서버 컴포넌트.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 구조화 데이터는 신뢰된 서버 생성 값만 담는다(사용자 입력 이스케이프 주의).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
