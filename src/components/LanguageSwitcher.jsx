// src/components/LanguageSwitcher.jsx
import { useState } from "react"
import Modal from "./Modal"
import useLanguage from "../hooks/useLanguage"
import { LANGUAGES, getLanguage } from "../data/languages"

// Two modes:
// - Uncontrolled (no value/onChange): reflects and controls the globally
//   remembered current language directly. Used for the Dashboard header pill.
// - Controlled (value + onChange provided): displays `value` instead of the
//   global current language, so e.g. editing an old session shows that
//   session's own language. Picking a language still updates the global
//   recent-languages list either way.
function LanguageSwitcher({ value, onChange, label }) {
  const { currentLanguage, recentLanguages, selectLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")

  const displayCode = value ?? currentLanguage.code
  const displayLanguage = getLanguage(displayCode)

  const handlePick = async (code) => {
    await selectLanguage(code)
    if (onChange) onChange(code)
    setIsOpen(false)
    setQuery("")
  }

  const filtered = LANGUAGES.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 800,
          color: "#f8fafc",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 999,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 16 }}>{displayLanguage.flag}</span>
        {displayLanguage.name}
        <span style={{ fontSize: 10, color: "#a5b4fc" }}>▾</span>
      </button>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <h3 style={{ margin: "0 0 18px 0", fontSize: 20, fontWeight: 900, color: "#ffffff", textAlign: "center" }}>
            {label || "Choose a language"}
          </h3>

          {recentLanguages.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Recent
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {recentLanguages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handlePick(l.code)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f8fafc",
                      background: l.code === displayCode ? "rgba(99,102,241,0.28)" : "rgba(255,255,255,0.04)",
                      border: l.code === displayCode ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >
                    <span>{l.flag}</span>
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages…"
            autoFocus
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: "inherit",
              color: "#f8fafc",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              outline: "none",
              marginBottom: 12,
            }}
          />

          <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {filtered.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, padding: "16px 0" }}>No languages match.</p>
            ) : (
              filtered.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handlePick(l.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "left",
                    color: "#f8fafc",
                    background: l.code === displayCode ? "rgba(99,102,241,0.18)" : "transparent",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{l.flag}</span>
                  {l.name}
                </button>
              ))
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

export default LanguageSwitcher