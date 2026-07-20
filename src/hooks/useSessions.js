// src/hooks/useSessions.js
import { useLiveQuery } from "dexie-react-hooks"
import db, { addSession, updateSession, deleteSession } from "../services/database"

function useSessions() {
  const sessions = useLiveQuery(
    async () => {
      if (!db || !db.sessions) return []
      return await db.sessions.toArray()
    },
    []
  )

  return {
    sessions: sessions || [],
    addSession,
    updateSession,
    deleteSession,
  }
}

export default useSessions