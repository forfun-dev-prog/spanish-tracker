// src/components/OptionalSessionDetails.jsx
import { useState, useEffect, useRef } from "react"
import useDetailSuggestions from "../hooks/useDetailSuggestions"

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

// Always visible now — nothing here is required to save a session, but it
// no longer hides behind a toggle. `category` scopes the suggestion chips
// and autocomplete so "Radio Ambulante" doesn't show up under Grammar.
function OptionalSessionDetails({ details, setDetails, difficulty, setDifficulty, category }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const blurTimeout = useRef(null)

  useEffect(() => () => clearTimeout(blurTimeout.current), [])

  const { suggestions, exclude, filterSuggestions } = useDetailSuggestions(category)
  const typedMatches = filterSuggestions(suggestions, details)
  const showAutocomplete = showDropdown && details.trim().length > 0 && typedMatches.length > 0

  const handleExclude = (e, text) => {
    e.stopPropagation()
    if (window.confirm(`Stop suggesting "${text}"? Past sessions won't be affected.`)) {
      exclude(text)
    }
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#a5b4fc" }}>
          Details
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Optional
        </span>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: 14,
        }}
      >
        <div style={{ marginBottom: 14, position: "relative" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>
            Notes <span style={{ opacity: 0.6 }}>(e.g. podcast or book title)</span>
          </label>

          {/* Recent-for-this-category chips — tap to fill instantly, no retyping. */}
          {suggestions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {suggestions.map((text) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 999,
                    padding: "4px 6px 4px 12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDetails(text)}
                    title={text}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#c7d2fe",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {text}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleExclude(e, text)}
                    title="Stop suggesting this (e.g. fix a typo)"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "0 2px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onFocus={() => {
              clearTimeout(blurTimeout.current)
              setShowDropdown(true)
            }}
            onBlur={() => {
              // Small delay so a click on a dropdown option registers before it unmounts.
              blurTimeout.current = setTimeout(() => setShowDropdown(false), 120)
            }}
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

          {/* Autocomplete while typing, filtered by what's already typed. */}
          {showAutocomplete && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "100%",
                marginTop: 4,
                background: "#1a103c",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                overflow: "hidden",
                zIndex: 5,
                boxShadow: "0 10px 25px -8px rgba(0,0,0,0.6)",
              }}
            >
              {typedMatches.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => {
                    setDetails(text)
                    setShowDropdown(false)
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    fontSize: 13,
                    color: "#e0e7ff",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}
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
    </div>
  )
}

export default OptionalSessionDetails