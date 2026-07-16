import { useState, useEffect } from "react"
import categories from "../data/defaultCategories"


// Converts an ISO date string (or nothing, meaning "now") into the
// yyyy-MM-ddThh:mm format that <input type="datetime-local"> expects.
function toDatetimeLocalValue(isoString) {
  const d = isoString ? new Date(isoString) : new Date()
  const pad = (n) => String(n).padStart(2, "0")

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}


// Used for both creating a new session and editing an existing one.
// Pass a `session` object to edit it, or omit it to create a new one.
function SessionForm({ session, onSave, onCancel }) {
  const isEditing = Boolean(session)

  const [category, setCategory] = useState(session?.category || categories[0])
  const [dateValue, setDateValue] = useState(toDatetimeLocalValue(session?.date))
  const [minutes, setMinutes] = useState(
    session ? String(Math.round(session.duration / 60)) : ""
  )
  const [error, setError] = useState("")

  // Keep the form in sync if the caller swaps which session is being edited
  useEffect(() => {
    setCategory(session?.category || categories[0])
    setDateValue(toDatetimeLocalValue(session?.date))
    setMinutes(session ? String(Math.round(session.duration / 60)) : "")
    setError("")
  }, [session])

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
    }

    if (isEditing) {
      onSave({ ...payload, id: session.id })
    } else {
      onSave(payload)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEditing ? "Edit session" : "Add session"}</h3>

      <div>
        <label>
          Activity{" "}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Date &amp; time{" "}
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Duration (minutes){" "}
          <input
            type="number"
            min="1"
            step="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
          />
        </label>
      </div>

      {error && <p>{error}</p>}

      <button type="submit">{isEditing ? "Save changes" : "Add session"}</button>{" "}
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  )
}

export default SessionForm
