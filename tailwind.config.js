/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Notion-inspired palette (light + dark via CSS variables)
        page: "var(--bg)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        fg: "var(--ink)",
        muted: "var(--text-muted)",
        line: "var(--border)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        ink: "var(--ink)",
        lime: "var(--lime)",
        track: "var(--track)",
      },
      fontFamily: {
        // 본문 기본. --font-display(IBM Plex Sans KR)가 한글을 포함하므로 그것을 먼저 둔다.
        sans: ["var(--font-display)", "ui-sans-serif", "-apple-system", "sans-serif"],
        // 제목·구조. app/layout.tsx 가 --font-display 로 노출한다.
        display: ["var(--font-display)", "ui-sans-serif", "-apple-system", "sans-serif"],
        // 본문 문단. app/layout.tsx 가 --font-serif 로 노출한다(Gowun Batang).
        serif: ["var(--font-serif)", "Georgia", "serif"],
        /*
          로고 워드마크. 계측 콘솔에서는 고정폭이 워드마크를 맡는다 —
          SEJUNE.DEV 가 계기판 라벨처럼 읽힌다. 별도 --font-logo 를 두지 않고
          --font-jbmono(IBM Plex Mono)를 재사용해 서체를 하나 덜 받는다.
        */
        logo: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1080px",
        prose: "720px",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
      animation: {
        rise: "rise .6s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
}
