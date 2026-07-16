// src/hooks/useSessions.js
import { useLiveQuery } from "dexie-react-hooks"
import db, { addSession, updateSession, deleteSession } from "../services/database"

function useSessions() {
  // Safe live query execution
  const sessions = useLiveQuery(
    async () => {
      if (!db || !db.sessions) return []
      return await db.sessions.toArray()
    },
    []
  )

  // Delegate writes to the service layer so every created session flows through
  // the token-aware addSession() (which awards spin tokens). Do NOT call
  // db.sessions.add() directly here — that bypasses the reward logic.
  //
  // Note: addSession() resolves to a reward status message (e.g. "You earned 2
  // Spin Token(s)!"), so callers can await it and surface that text if desired.
  // updateSession() intentionally does not award tokens (editing shouldn't re-pay).
  return {
    // Falls back to empty array while loading database values
    sessions: sessions || [],
    addSession,
    updateSession,
    deleteSession,
  }
}

export default useSessions