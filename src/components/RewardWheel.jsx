// src/components/RewardWheel.jsx
import { useState, useRef } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import db, { getBalance, updateBalance } from "../services/database"

const PRIZES = [
  { label: "5,000", color: "#ec4899", value: 5000 },  // Pink
  { label: "1,000", color: "#eab308", value: 1000 },  // Yellow
  { label: "2,000", color: "#22c55e", value: 2000 },  // Green
  { label: "1,500", color: "#f43f5e", value: 1500 },  // Rose
  { label: "3,000", color: "#a855f7", value: 3000 },  // Purple
  { label: "8,000", color: "#eab308", value: 8000 },  // Yellow
  { label: "5,000", color: "#06b6d4", value: 5000 },  // Cyan
  { label: "1,000", color: "#ec4899", value: 1000 },  // Pink
  { label: "3,000", color: "#a855f7", value: 3000 },  // Purple
  { label: "1,500", color: "#eab308", value: 1500 },  // Yellow
  { label: "7,000", color: "#22c55e", value: 7000 },  // Green
  { label: "4,000", color: "#a855f7", value: 4000 },  // Purple
  { label: "10,000", color: "#eab308", value: 10000 },// Gold/Yellow Jackpot!
  { label: "3,000", color: "#06b6d4", value: 3000 },  // Cyan
  { label: "2,500", color: "#f43f5e", value: 2500 }   // Rose
]

function RewardWheel() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningText, setWinningText] = useState("")
  const wheelRef = useRef(null)

  const balances = useLiveQuery(async () => {
    const tokens = await getBalance("tokens")
    const coins = await getBalance("coins")
    return { tokens, coins }
  }, [])

  const tokens = balances?.tokens || 0
  const coins = balances?.coins || 0

  const totalSlices = PRIZES.length
  const sliceDegrees = 360 / totalSlices
  
  // Design Dimensions
  const size = 360
  const center = size / 2
  const outerGoldRadius = 170
  const innerWheelRadius = 152
  const innerHubRadius = 45

  async function spinWheel() {
    if (isSpinning || tokens <= 0) return

    setIsSpinning(true)
    setWinningText("")
    
    await updateBalance("tokens", tokens - 1)

    const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360
    const targetSliceIndex = Math.floor(Math.random() * totalSlices)
    
    // ADJUSTED MATH: Subtract half a slice's width (sliceDegrees / 2) to land dead-center!
    const targetDegrees = extraSpins + (360 - (targetSliceIndex * sliceDegrees)) - (sliceDegrees / 2)

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 6s cubic-bezier(0.15, 0.85, 0.15, 1)"
      wheelRef.current.style.transform = `rotate(${targetDegrees}deg)`
    }

    setTimeout(async () => {
      setIsSpinning(false)
      const prize = PRIZES[targetSliceIndex]
      
      await updateBalance("coins", coins + prize.value)
      setWinningText(`🎉 Amazing! You landed on +${prize.value} Coins!`)

      if (wheelRef.current) {
        wheelRef.current.style.transition = "none"
        // Maintain local visual alignment dead-center on reset
        wheelRef.current.style.transform = `rotate(${360 - (targetSliceIndex * sliceDegrees) - (sliceDegrees / 2)}deg)`
      }
    }, 6000)
  }

  function getSlicePath(index) {
    const startAngle = (index * sliceDegrees - 90) * (Math.PI / 180)
    const endAngle = ((index + 1) * sliceDegrees - 90) * (Math.PI / 180)

    const x1 = center + innerWheelRadius * Math.cos(startAngle)
    const y1 = center + innerWheelRadius * Math.sin(startAngle)
    const x2 = center + innerWheelRadius * Math.cos(endAngle)
    const y2 = center + innerWheelRadius * Math.sin(endAngle)

    return `M ${center} ${center} L ${x1} ${y1} A ${innerWheelRadius} ${innerWheelRadius} 0 0 1 ${x2} ${y2} Z`
  }

  return (
    <div style={{ 
      textAlign: "center", 
      maxWidth: "420px", 
      margin: "20px auto", 
      padding: "24px", 
      background: "radial-gradient(circle, #1a103c 0%, #090514 100%)",
      color: "#f8fafc",
      borderRadius: "28px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(139, 92, 246, 0.15)"
    }}>
      <h2 style={{ fontSize: "26px", fontWeight: "900", margin: "0 0 4px 0", letterSpacing: "1px", color: "#fef08a", textShadow: "0 0 10px rgba(234,179,8,0.3)" }}>
        🎰 Reward Casino
      </h2>
      
      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "14px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tokens Available</span>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#38bdf8" }}>🪙 {tokens}</div>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Balance</span>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#fbbf24" }}>🌟 {coins.toLocaleString()}</div>
        </div>
      </div>
      
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px`, margin: "0 auto 24px auto" }}>
        
        <div style={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "90%",
          height: "90%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
          filter: "blur(12px)",
          pointerEvents: "none"
        }} />

        {/* Top Gold Pointer Pin */}
        <div style={{
          position: "absolute",
          top: "-5px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none",
          filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.5))"
        }}>
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none">
            <path d="M20 45 C28 32, 36 24, 36 16 A16 16 0 0 0 4 16 C4 24, 12 32, 20 45 Z" fill="url(#goldGrad)" />
            <circle cx="20" cy="16" r="8" fill="url(#innerGold)" />
            
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <radialGradient id="innerGold">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#a16207" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Outer Heavy 3D Golden Rim (Stationary) */}
        <div style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 2
        }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="metallicGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="25%" stopColor="#ca8a04" />
                <stop offset="50%" stopColor="#fef9c3" />
                <stop offset="75%" stopColor="#a16207" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>

            <circle cx={center} cy={center} r={outerGoldRadius} fill="none" stroke="url(#metallicGold)" strokeWidth="18" />
            <circle cx={center} cy={center} r={outerGoldRadius - 9} fill="none" stroke="#78350f" strokeWidth="1" />
            <circle cx={center} cy={center} r={outerGoldRadius + 9} fill="none" stroke="#78350f" strokeWidth="1" />

            {Array.from({ length: 16 }).map((_, idx) => {
              const angle = (idx * (360 / 16)) * (Math.PI / 180)
              const px = center + (outerGoldRadius) * Math.cos(angle)
              const py = center + (outerGoldRadius) * Math.sin(angle)
              return (
                <g key={idx}>
                  <circle cx={px} cy={py} r="4" fill="#fef9c3" />
                  <circle cx={px} cy={py} r="2" fill="#854d0e" />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Spinning Wheel Segments Layer */}
        <div 
          ref={wheelRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden"
          }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
            <g>
              {PRIZES.map((prize, idx) => {
                const sliceMidAngle = idx * sliceDegrees + (sliceDegrees / 2)
                
                const textAngleRad = (sliceMidAngle - 90) * (Math.PI / 180)
                const textX = center + (innerWheelRadius * 0.65) * Math.cos(textAngleRad)
                const textY = center + (innerWheelRadius * 0.65) * Math.sin(textAngleRad)

                return (
                  <g key={idx}>
                    <path d={getSlicePath(idx)} fill={prize.color} stroke="#1e1b4b" strokeWidth="1.5" />
                    
                    <text
                      x={textX}
                      y={textY}
                      transform={`rotate(${sliceMidAngle - 90}, ${textX}, ${textY})`}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="900"
                      style={{ 
                        letterSpacing: "0.5px", 
                        fontFamily: "system-ui, sans-serif",
                        textShadow: "0px 2px 4px rgba(0,0,0,0.8), -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000" 
                      }}
                    >
                      {prize.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Central Bezel "SPIN" Hub Button */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${innerHubRadius * 2}px`,
          height: `${innerHubRadius * 2}px`,
          zIndex: 5,
          cursor: tokens > 0 && !isSpinning ? "pointer" : "not-allowed",
        }} onClick={spinWheel}>
          <svg width={innerHubRadius * 2} height={innerHubRadius * 2} viewBox="0 0 90 90">
            <defs>
              <linearGradient id="centerBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>

            <circle cx="45" cy="45" r="42" fill="none" stroke="url(#metallicGold)" strokeWidth="6" />
            <circle cx="45" cy="45" r="42" fill="none" stroke="#78350f" strokeWidth="1" />
            
            <circle cx="45" cy="45" r="36" fill="url(#centerBlueGrad)" />
            <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            
            <text
              x="45"
              y="45"
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="#ffffff"
              fontSize="16"
              fontWeight="900"
              style={{ 
                letterSpacing: "1px", 
                fontFamily: "system-ui, sans-serif",
                textShadow: "0px 2px 5px rgba(0,0,0,0.5)"
              }}
            >
              SPIN
            </text>
          </svg>
        </div>

      </div>

      <button 
        onClick={spinWheel} 
        disabled={isSpinning || tokens === 0}
        style={{
          width: "100%",
          padding: "14px 24px",
          fontSize: "18px",
          fontWeight: "900",
          backgroundColor: tokens > 0 && !isSpinning ? "#fbbf24" : "#334155",
          color: tokens > 0 && !isSpinning ? "#0f172a" : "#64748b",
          border: "none",
          borderRadius: "16px",
          cursor: tokens > 0 && !isSpinning ? "pointer" : "not-allowed",
          boxShadow: tokens > 0 && !isSpinning ? "0 10px 25px -5px rgba(251, 191, 36, 0.4)" : "none",
          textTransform: "uppercase",
          letterSpacing: "1px",
          transition: "all 0.15s ease"
        }}
      >
        {isSpinning ? "🎰 Spinning..." : `SPIN WHEEL (1 Token)`}
      </button>

      {winningText && (
        <p style={{ 
          marginTop: "16px", 
          fontSize: "15px", 
          color: "#a7f3d0", 
          fontWeight: "900",
          background: "rgba(52, 211, 153, 0.1)",
          border: "1px solid rgba(52, 211, 153, 0.2)",
          padding: "12px",
          borderRadius: "12px",
          textShadow: "0 0 8px rgba(52, 211, 153, 0.2)"
        }}>
          {winningText}
        </p>
      )}
    </div>
  )
}

export default RewardWheel