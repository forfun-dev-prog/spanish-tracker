// src/components/OptionalSessionDetails.jsx
import { useState, useEffect } from "react"

// Exported so History (and later Stats/Achievements) can render the same
// emoji + label for a stored difficulty value without redefining the scale.
export const DIFFICULTY_LEVELS = [
  { value: 1, emoji: "😌", label: "Very Easy" },
  { value: 2, emoji: "🙂", label: "Easy" },
  { value: 3, emoji: "😐", label: "Medium" },
  { value: 4, emoji: "😓", label: "Hard" },
  { value: 5, emoji: "🥵", label: "Very Hard" },
]

export function getDifficultyMeta(value) {
  return DIFFICULTY_LEVELS.find((l) => l.value === value) || null
}

// A collapsed-by-default "add more" section so quick logging never gets
// slower. Pass startOpen when editing a session that already has data, so
// existing details aren't hidden behind a toggle the person has to guess at.
function OptionalSessionDetails({ details, setDetails, difficulty, setDifficulty, startOpen = false }) {
  const [open, setOpen] = useState(startOpen)

  useEffect(() => {
    if (startOpen) setOpen(true)
  }, [startOpen])

  return (
    <div style={{ marginBottom: 18 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none",
          border: "none",
          color: "#818cf8",
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          cursor: "pointer",
          padding: 0,
          marginBottom: open ? 14 : 0,
        }}
      >
        {open ? "− Hide details" : "+ Add details (optional)"}
      </button>

      {open && (
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
              Notes <span style={{ opacity: 0.6 }}>(e.g. podcast or book title)</span>
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="What were you working on?"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "inherit",
                color: "#f8fafc",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
              Perceived difficulty
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {DIFFICULTY_LEVELS.map((lvl) => {
                const active = difficulty === lvl.value
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    title={lvl.label}
                    onClick={() => setDifficulty(active ? null : lvl.value)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      fontSize: 18,
                      lineHeight: 1,
                      borderRadius: 10,
                      cursor: "pointer",
                      background: active ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.04)",
                      border: active ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.08)",
                      transition: ".15s",
                    }}
                  >
                    {lvl.emoji}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptionalSessionDetails