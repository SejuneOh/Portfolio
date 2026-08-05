"use client"

import { useEffect, useRef } from "react"

/*
  계측 배경 — 지면 전체에 깔리는 계기판.

  네 겹이다. 격자·그레인·비네트는 CSS 로 고정이고, 파형만 캔버스로 움직인다.
  (site) 레이아웃에만 붙는다 — 관리자 화면에는 올라가지 않는다.

  파형 색은 하드코딩하지 않고 :root 토큰(--ch2 · --lime · --ch3)을 읽어서 쓴다.
  팔레트를 고칠 때 이 파일을 같이 고쳐야 하는 상황을 만들지 않기 위한 것이다.
*/

// 채널별 파형 규격. y 는 화면 높이 비율, alpha 는 선 불투명도.
const CHANNELS = [
  { token: "--ch2", y: 0.3, amp: 16, freq: 0.011, speed: 1.0, alpha: 0.3 },
  { token: "--lime", y: 0.62, amp: 9, freq: 0.017, speed: 1.5, alpha: 0.24 },
  { token: "--ch3", y: 0.86, amp: 22, freq: 0.007, speed: 0.7, alpha: 0.13 },
] as const

// "#4fd0d8" → "rgba(79,208,216,0.3)". 토큰이 hex 가 아니면 그대로 넘긴다.
function withAlpha(hex: string, alpha: number) {
  const h = hex.trim()
  if (!/^#[0-9a-f]{6}$/i.test(h)) return h
  const n = parseInt(h.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

export default function InstrumentBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const root = getComputedStyle(document.documentElement)
    const colors = CHANNELS.map((c) => withAlpha(root.getPropertyValue(c.token), c.alpha))

    let raf = 0
    let phase = 0

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
      배경이 사라지므로 resize 뒤에는 반드시 한 장 다시 그린다.
    */
    function onResize() {
      resize()
      draw()
    }

    function stop() {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    function loop() {
      phase += 0.006
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
      loop()
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
        --glow1/--glow2 를 그대로 쓰지 않는다. 그 값은 알파가 .42·.34 로 강조용이라
        전면에 깔면 지면이 뜬다. color-mix 로 같은 토큰에서 약한 알파를 만든다.
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
