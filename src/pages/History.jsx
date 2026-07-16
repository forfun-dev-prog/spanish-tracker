import { useState } from "react"
import useSessions from "../hooks/useSessions"
import SessionForm from "../components/SessionForm"
import { addSession, updateSession, deleteSession } from "../services/database"


function History() {

  const { sessions, refreshSessions } = useSessions()

  // null = closed, "add" = creating a new session, a session object = editing that session
  const [formTarget, setFormTarget] = useState(null)

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  async function handleSave(payload) {
    if (payload.id) {
      const { id, ...changes } = payload
      await updateSession(id, changes)
    } else {
      await addSession(payload)
    }

    setFormTarget(null)
    refreshSessions()
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this session? This can't be undone.")
    if (!confirmed) return

    await deleteSession(id)
    refreshSessions()
  }

  return (
    <div>

      <h1>📚 Study History</h1>

      {formTarget && (
        <SessionForm
          session={formTarget === "add" ? undefined : formTarget}
          onSave={handleSave}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {!formTarget && (
        <button onClick={() => setFormTarget("add")}>
          + Add session
        </button>
      )}

      <hr />

      {sorted.length === 0 && (
        <p>No sessions yet</p>
      )}

      {sorted.map((session) => (

        <div key={session.id}>

          <h3>
            {session.category}
          </h3>

          <p>
            {Math.round(session.duration / 60)} min
          </p>

          <p>
            {new Date(session.date).toLocaleString()}
          </p>

          <button onClick={() => setFormTarget(session)}>
            Edit
          </button>{" "}

          <button onClick={() => handleDelete(session.id)}>
            Delete
          </button>

          <hr />

        </div>

      ))}

    </div>
  )
}


export default History
