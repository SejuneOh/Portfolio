"use client"

import { useEffect, useRef } from "react"

/*
  계측 배경 — 지면 전체에 깔리는 계기판.

  네 겹이다. 격자·그레인·비네트는 CSS 로 고정이고, 파형만 캔버스로 움직인다.
  (site) 레이아웃에만 붙는다 — 관리자 화면에는 올라가지 않는다.

  파형 색은 하드코딩하지 않고 :root 토큰(--ch2 · --lime · --ch3)을 읽어서 쓴다.
  팔레트를 고칠 때 이 파일을 같이 고쳐야 하는 상황을 만들지 않기 위한 것이다.
*/

/*
  채널별 파형 규격. y 는 화면 높이 비율, alpha 는 선 불투명도.

  fallback 은 토큰을 못 읽었을 때만 쓰는 안전값이다. 토큰이 여전히 정본이고
  이 값은 화면이 조용히 비는 것을 막기 위한 것이다 — 아래 withAlpha 주석 참조.
*/
const CHANNELS = [
  { token: "--ch2", fallback: "#4fd0d8", y: 0.3, amp: 16, freq: 0.011, speed: 1.0, alpha: 0.3 },
  { token: "--lime", fallback: "#d8f26a", y: 0.62, amp: 9, freq: 0.017, speed: 1.5, alpha: 0.24 },
  { token: "--ch3", fallback: "#f2a54a", y: 0.86, amp: 22, freq: 0.007, speed: 0.7, alpha: 0.13 },
] as const

/*
  "#4fd0d8" → "rgba(79,208,216,0.3)".

  토큰이 없으면 getPropertyValue 가 빈 문자열을 준다. 그것을 그대로 strokeStyle 에 넣으면
  Canvas2D 는 **잘못된 값을 조용히 무시**하고 기본색(검정)으로 그린다 — 어두운 지면에서는
  선이 사라진 것처럼 보이고 원인도 남지 않는다. hex 가 아니면 fallback 으로 되돌린다.
*/
function withAlpha(value: string, fallback: string, alpha: number) {
  const h = value.trim()
  const hex = /^#[0-9a-f]{6}$/i.test(h) ? h : fallback
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

/*
  파형이 1ms 에 나아가는 위상. 이전에는 rAF 콜백마다 고정값(0.006)을 더해서
  120Hz 화면에서 60Hz 의 두 배로 흘렀다 — CHANNELS 의 speed 가 물리적 속도를 뜻하지 못했다.
  60Hz 기준(16.67ms × 0.00036 ≈ 0.006)을 유지하면서 프레임레이트와 무관하게 만든다.
*/
const PHASE_PER_MS = 0.00036

// 탭 복귀·긴 정지 뒤 dt 가 커져 파형이 순간 이동하는 것을 막는다.
const MAX_DT = 100

export default function InstrumentBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const root = getComputedStyle(document.documentElement)
    const colors = CHANNELS.map((c) =>
      withAlpha(root.getPropertyValue(c.token), c.fallback, c.alpha)
    )

    let raf = 0
    let resizeRaf = 0
    let phase = 0
    let last = 0

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas!.width = Math.round(window.innerWidth * dpr)
      canvas!.height = Math.round(window.innerHeight * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx!.clearRect(0, 0, w, h)
      CHANNELS.forEach((c, i) => {
        const mid = h * c.y
        ctx!.beginPath()
        for (let x = 0; x <= w; x += 6) {
          const v =
            Math.sin(x * c.freq + phase * c.speed) * c.amp +
            Math.sin(x * c.freq * 2.3 + phase * c.speed * 1.6) * (c.amp * 0.32)
          if (x === 0) ctx!.moveTo(x, mid + v)
          else ctx!.lineTo(x, mid + v)
        }
        ctx!.strokeStyle = colors[i]
        ctx!.lineWidth = 1
        ctx!.stroke()
      })
    }

    /*
      크기를 다시 잡으면 캔버스 내용이 지워진다. 정지 상태에서 창을 줄이면
      배경이 사라지므로 resize 뒤에는 한 장 다시 그린다.

      resize 이벤트마다 바로 처리하지 않고 rAF 한 프레임으로 합친다.
      백킹 스토어 재할당은 2560×1600·dpr2 에서 한 번에 약 16MB 다. 창을 드래그로 줄이면
      초당 수십 번 일어나고, **iOS Safari 는 스크롤 중 주소창이 접힐 때마다 resize 를 쏘므로**
      모바일에서 이 경로가 상시 발동한다.

      애니메이션 중에는 다음 프레임이 어차피 그리므로 여기서 draw 하지 않는다.
    */
    function onResize() {
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0
        resize()
        if (motion.matches) draw()
      })
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf)
        resizeRaf = 0
      }
    }

    // 경과 시간으로 위상을 나아가게 한다 — 화면 주사율이 달라도 같은 속도로 흐른다.
    function loop(now: number) {
      const dt = last ? Math.min(now - last, MAX_DT) : 0
      last = now
      phase += dt * PHASE_PER_MS
      draw()
      raf = requestAnimationFrame(loop)
    }

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")

    function start() {
      stop()
      resize()
      if (motion.matches) {
        // 움직임만 멈춘다. 빈 화면이 아니라 정지 프레임 한 장을 남긴다.
        draw()
        return
      }
      // 재개 시 dt 가 정지 구간만큼 커지지 않도록 기준을 비운다.
      last = 0
      raf = requestAnimationFrame(loop)
    }

    // 탭이 가려지면 굳이 그리지 않는다. 돌아오면 다시 시작한다.
    function onVisibility() {
      if (document.hidden) stop()
      else start()
    }

    start()
    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)
    motion.addEventListener("change", start)

    return () => {
      stop()
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      motion.removeEventListener("change", start)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 print:hidden">
      {/* 격자 — 위에서 아래로 사라지는 마스크를 걸어 본문 아래쪽을 비운다 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
          backgroundSize: "100% 76px, 76px 100%",
          maskImage: "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 100%)",
        }}
      />

      {/* 파형 3채널 */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/*
        비네트 — 상단에 청록·라임 광원.
        --ch2/--lime 에서 color-mix 로 약한 알파를 만들어 쓴다.

        예전에는 --glow1/--glow2 라는 토큰이 있었는데 알파가 .42·.34 로 강조용이라
        전면에 깔면 지면이 떴다. 그래서 여기서 쓰지 않았고, 결국 참조가 0이 되어
        #222 에서 토큰을 지웠다.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% -10%, color-mix(in srgb, var(--ch2) 10%, transparent), transparent 60%), radial-gradient(70% 60% at 88% 12%, color-mix(in srgb, var(--lime) 7%, transparent), transparent 60%)",
        }}
      />

      {/* 그레인 — 계기판 표면의 거친 질감 */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
