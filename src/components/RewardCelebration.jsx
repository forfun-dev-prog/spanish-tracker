// src/components/RewardCelebration.jsx
import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react"

// celebrate({ title, subtitle }) triggers a confetti burst + a happy toast.
const RewardContext = createContext(() => {})
export const useReward = () => useContext(RewardContext)

const CONFETTI_COLORS = ["#fbbf24", "#f472b6", "#34d399", "#60a5fa", "#a78bfa", "#f87171", "#facc15", "#22d3ee"]

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function ConfettiCanvas({ fireKey }) {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const raf = useRef(0)

  useEffect(() => {
    if (!fireKey) return
    if (prefersReducedMotion()) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    // Spawn an upward burst from near the top-center.
    const cx = window.innerWidth / 2
    const originY = window.innerHeight * 0.28
    const count = 150
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
      const speed = 6 + Math.random() * 8
      particles.current.push({
        x: cx + (Math.random() - 0.5) * 160,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 7,
        color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        life: 1,
      })
    }

    const gravity = 0.22
    const drag = 0.99
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const alive = []
      for (const p of particles.current) {
        p.vy += gravity
        p.vx *= drag
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= 0.007
        if (p.life > 0 && p.y < window.innerHeight + 40) {
          alive.push(p)
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rot)
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life))
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
          ctx.restore()
        }
      }
      particles.current = alive
      if (alive.length > 0) {
        raf.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener("resize", resize)
      particles.current = []
      if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
  }, [fireKey])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }}
    />
  )
}

export function RewardProvider({ children }) {
  const [toast, setToast] = useState(null) // { title, subtitle, key }
  const timerRef = useRef(0)

  const celebrate = useCallback((payload) => {
    setToast({ title: payload.title, subtitle: payload.subtitle, key: Date.now() + Math.random() })
  }, [])

  useEffect(() => {
    if (!toast) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timerRef.current)
  }, [toast])

  return (
    <RewardContext.Provider value={celebrate}>
      {children}

      <ConfettiCanvas fireKey={toast?.key || 0} />

      {toast && (
        <div
          onClick={() => setToast(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10000,
            padding: 24,
          }}
        >
          <div
            data-reward-toast
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              animation: "reward-pop .5s cubic-bezier(.18,.89,.32,1.28)",
              background: "linear-gradient(135deg,#fde68a 0%,#fbbf24 45%,#f59e0b 100%)",
              color: "#3b1d00",
              borderRadius: 18,
              padding: "16px 24px",
              minWidth: 260,
              maxWidth: 360,
              textAlign: "center",
              boxShadow: "0 18px 40px -8px rgba(245,158,11,.5), inset 0 1px 0 rgba(255,255,255,.5)",
              border: "1px solid rgba(255,255,255,.5)",
            }}
          >
            <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 6 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: ".3px" }}>{toast.title}</div>
            {toast.subtitle && (
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, opacity: 0.85 }}>{toast.subtitle}</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes reward-pop {
          0%   { transform: translateY(-24px) scale(.85); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reward-toast] { animation: none !important; }
        }
      `}</style>
    </RewardContext.Provider>
  )
}

export default RewardProvider