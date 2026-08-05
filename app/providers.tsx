// 다크 모드를 제거하면서 테마 프로바이더가 빠졌다. 현재 감쌀 프로바이더가 없어
// 자식을 그대로 통과시킨다. app/layout.tsx가 이 컴포넌트를 참조하므로 파일은 남긴다.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
