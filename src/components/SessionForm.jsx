import { useState, useEffect } from "react"
import categories from "../data/defaultCategories"
import OptionalSessionDetails from "./OptionalSessionDetails"
import LanguageSwitcher from "./LanguageSwitcher"
import useLanguage from "../hooks/useLanguage"

function toDatetimeLocalValue(isoString) {
  const d = isoString ? new Date(isoString) : new Date()
  const tzOffset = d.getTimezoneOffset() * 60000
  const localISOTime = new Date(d.getTime() - tzOffset).toISOString()
  return localISOTime.slice(0, 16)
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#a5b4fc",
  marginBottom: 6,
}

const fieldWrapStyle = { marginBottom: 18 }

const inputBaseStyle = {
  boxSizing: "border-box",
  padding: "11px 14px",
  fontSize: 15,
  fontFamily: "inherit",
  color: "#f8fafc",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
  colorScheme: "dark",
}

function useFocusGlow() {
  const [focused, setFocused] = useState(false)
  return {
    focused,
    handlers: {
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
    style: focused
      ? { borderColor: "#818cf8", boxShadow: "0 0 0 3px rgba(99,102,241,0.25)" }
      : {},
  }
}

function Field({ label, children }) {
  return (
    <div style={fieldWrapStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function SessionForm({ session, onSave, onCancel }) {
  const isEditing = Boolean(session)
  const { currentLanguage } = useLanguage()

  const [category, setCategory] = useState(session?.category || categories[0])
  const [dateValue, setDateValue] = useState(toDatetimeLocalValue(session?.date))
  const [minutes, setMinutes] = useState(
    session ? String(Math.round(session.duration / 60)) : ""
  )
  const [languageCode, setLanguageCode] = useState(session?.language || null)
  const [details, setDetails] = useState(session?.details || "")
  const [difficulty, setDifficulty] = useState(session?.difficulty || null)
  const [error, setError] = useState("")

  useEffect(() => {
    setCategory(session?.category || categories[0])
    setDateValue(toDatetimeLocalValue(session?.date))
    setMinutes(session ? String(Math.round(session.duration / 60)) : "")
    setLanguageCode(session?.language || null)
    setDetails(session?.details || "")
    setDifficulty(session?.difficulty || null)
    setError("")
  }, [session])

  const effectiveLanguageCode = languageCode || currentLanguage.code

  function handleSubmit(e) {
    e.preventDefault()

    const parsedMinutes = Number(minutes)

    if (!parsedMinutes || parsedMinutes <= 0) {
      setError("Enter a duration greater than 0 minutes.")
      return
    }

    const payload = {
      category,
      date: new Date(dateValue).toISOString(),
      duration: Math.round(parsedMinutes * 60),
      language: effectiveLanguageCode,
      details: details.trim() || null,
      difficulty: difficulty || null,
    }

    if (isEditing) {
      onSave({ ...payload, id: session.id })
    } else {
      onSave(payload)
    }
  }

  const dateGlow = useFocusGlow()
  const minutesGlow = useFocusGlow()
  const categoryGlow = useFocusGlow()

  return (
    <form onSubmit={handleSubmit}>
      <h3
        style={{
          margin: "0 0 24px 0",
          fontSize: 24,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {isEditing ? "Edit session" : "Add session"}
      </h3>

      <Field label="Language">
        <LanguageSwitcher value={effectiveLanguageCode} onChange={setLanguageCode} />
      </Field>

      <Field label="Activity">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          {...categoryGlow.handlers}
          style={{ ...inputBaseStyle, ...categoryGlow.style, width: "100%", cursor: "pointer" }}
        >
          {categories.map((c) => (
            <option key={c} value={c} style={{ background: "#1a103c", color: "#f8fafc" }}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div style={{ flex: "2 1 200px", minWidth: 0 }}>
          <label style={labelStyle}>Date &amp; time</label>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            required
            {...dateGlow.handlers}
            style={{ ...inputBaseStyle, ...dateGlow.style, width: "100%" }}
          />
        </div>

        <div style={{ flex: "1 1 110px", minWidth: 0 }}>
          <label style={labelStyle}>Duration</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="25"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
              {...minutesGlow.handlers}
              style={{ ...inputBaseStyle, ...minutesGlow.style, width: "100%", minWidth: 0, textAlign: "center" }}
            />
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>min</span>
          </div>
        </div>
      </div>

      <OptionalSessionDetails
        details={details}
        setDetails={setDetails}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        category={category}
      />

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: "12px 18px",
            fontSize: 14,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#0f172a",
            background: "#fbbf24",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(251,191,36,0.3)",
          }}
        >
          {isEditing ? "Save changes" : "Add session"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "12px 18px",
            fontSize: 14,
            fontWeight: 700,
            color: "#cbd5e1",
            background: "rgba(255,255,255,0.06)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default SessionForm