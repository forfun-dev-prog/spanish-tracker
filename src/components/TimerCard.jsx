// src/components/TimerCard.jsx
import { useState } from "react"
import useTimer from "../hooks/useTimer"
import { useReward } from "./RewardCelebration"
import OptionalSessionDetails from "./OptionalSessionDetails"

function TimerCard({ category, onSaveSession }) {
  const { seconds, running, start, stop, reset } = useTimer()
  const celebrate = useReward()

  const [details, setDetails] = useState("")
  const [difficulty, setDifficulty] = useState(null)

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleStopAndSave = async () => {
    if (seconds === 0) return
    stop()

    if (onSaveSession) {
      const result = await onSaveSession({
        category: category,
        date: new Date().toISOString(),
        duration: seconds,
        // Always included (as null when unset) so the record shape stays
        // consistent whether or not someone bothered to fill these in.
        details: details.trim() || null,
        difficulty: difficulty || null,
      })

      if (result && result.tokensEarned > 0) {
        celebrate({
          title: `+${result.tokensEarned} Spin Token${result.tokensEarned > 1 ? "s" : ""}`,
          subtitle: result.message,
        })
      }
    }

    reset()
    setDetails("")
    setDifficulty(null)
  }

  return (
    <div style={{
      background: "rgba(15, 10, 30, 0.6)",
      border: "2px solid #312e81",
      borderRadius: "24px",
      padding: "24px 20px 32px 20px", // Adjusted top padding
      boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.6), 0 10px 20px rgba(0, 0, 0, 0.45)",
      textAlign: "center"
    }}>
      <div style={{
        display: "inline-block",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        padding: "6px 14px",
        borderRadius: "20px",
        border: "1px solid rgba(99, 102, 241, 0.25)",
        marginBottom: "16px"
      }}>
        <span style={{ fontSize: "11px", fontWeight: "800", color: "#818cf8", textTransform: "uppercase", letterSpacing: "1px" }}>
          Current: {category}
        </span>
      </div>

      <div style={{
        fontSize: "64px",
        fontWeight: "900",
        color: running ? "#38bdf8" : "#ffffff",
        fontFamily: "monospace, system-ui",
        letterSpacing: "2px",
        marginTop: "8px",
        marginBottom: "24px",
        lineHeight: "1.1",
        textShadow: running ? "0 0 20px rgba(56, 189, 248, 0.4)" : "0px 4px 10px rgba(0, 0, 0, 0.5)"
      }}>
        {formatTime(seconds)}
      </div>

      {/* Optional details — collapsed by default, doesn't slow down a quick Start/Save */}
      <div style={{ textAlign: "left", marginBottom: "8px" }}>
        <OptionalSessionDetails
          details={details}
          setDetails={setDetails}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          category={category}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {!running ? (
          <button
            onClick={start}
            style={{
              flex: "1",
              maxWidth: "120px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "800",
              backgroundColor: "#22c55e",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 6px 15px rgba(34, 197, 94, 0.3)",
              textTransform: "uppercase"
            }}
          >
            Start
          </button>
        ) : (
          <button
            onClick={stop}
            style={{
              flex: "1",
              maxWidth: "120px",
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: "800",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 6px 15px rgba(239, 68, 68, 0.3)",
              textTransform: "uppercase"
            }}
          >
            Pause
          </button>
        )}

        <button
          onClick={handleStopAndSave}
          disabled={seconds === 0}
          style={{
            flex: "1",
            maxWidth: "140px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: "800",
            backgroundColor: seconds > 0 ? "#fbbf24" : "#334155",
            color: seconds > 0 ? "#0f172a" : "#64748b",
            border: "none",
            borderRadius: "12px",
            cursor: seconds > 0 ? "pointer" : "not-allowed",
            boxShadow: seconds > 0 ? "0 6px 15px rgba(251, 191, 36, 0.25)" : "none",
            textTransform: "uppercase"
          }}
        >
          Save
        </button>

        <button
          onClick={() => {
            reset()
            setDetails("")
            setDifficulty(null)
          }}
          disabled={seconds === 0 && !running}
          style={{
            padding: "10px 14px",
            fontSize: "14px",
            fontWeight: "700",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            color: "#94a3b8",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer"
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default TimerCard