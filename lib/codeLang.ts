// 코드블록 언어 매핑.
// - 쓰기: 마크다운 펜스 언어(```ts) → Notion code 블록 언어 enum(유효값만, 아니면 plain text)
// - 읽기: Notion 언어 → Shiki 하이라이트 언어 id(모르면 text)

// 펜스 별칭 → Notion 언어 enum
const FENCE_TO_NOTION: Record<string, string> = {
  cs: "c#", "c#": "c#", csharp: "c#",
  ts: "typescript", typescript: "typescript", tsx: "typescript",
  js: "javascript", javascript: "javascript", jsx: "javascript",
  sql: "sql",
  bash: "bash", sh: "shell", shell: "shell", zsh: "shell",
  json: "json", yaml: "yaml", yml: "yaml",
  xml: "xml", html: "html", css: "css",
  docker: "docker", dockerfile: "docker",
  diff: "diff", go: "go", py: "python", python: "python",
  rust: "rust", rs: "rust", java: "java", kotlin: "kotlin", kt: "kotlin",
}

// Notion 언어 → Shiki lang id
const NOTION_TO_SHIKI: Record<string, string> = {
  "c#": "csharp", typescript: "typescript", javascript: "javascript",
  sql: "sql", bash: "bash", shell: "shellscript",
  json: "json", yaml: "yaml", xml: "xml", html: "html", css: "css",
  docker: "dockerfile", diff: "diff", go: "go", python: "python",
  rust: "rust", java: "java", kotlin: "kotlin", "plain text": "text",
}

// Shiki 에 안전하게 넘길 lang(로드 대상). Shiki 가 번들로 로드할 수 있는 id 목록.
export const SHIKI_LANGS = [
  "csharp", "typescript", "javascript", "sql", "bash", "shellscript",
  "json", "yaml", "xml", "html", "css", "dockerfile", "diff", "go",
  "python", "rust", "java", "kotlin", "text",
] as const

export function fenceToNotion(fence: string): string {
  const k = (fence || "").trim().toLowerCase()
  return FENCE_TO_NOTION[k] || "plain text"
}

export function notionToShiki(lang?: string): string {
  const k = (lang || "").trim().toLowerCase()
  return NOTION_TO_SHIKI[k] || "text"
}
