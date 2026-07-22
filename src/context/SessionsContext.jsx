// src/context/SessionsContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth } from "./AuthContext"
import * as db from "../services/database"

const SessionsContext = createContext(null)

const sortByDateDesc = (arr) => [...arr].sort((a, b) => new Date(b.date) - new Date(a.date))

// Supabase, unlike Dexie, doesn't automatically notify every component when
// data changes — there's no built-in useLiveQuery equivalent. This context
// is the replacement: fetch once, then keep local state in sync by updating
// it directly after each successful write, so every consumer (History,
// Stats, Plan, TimerCard) stays consistent without each one re-fetching.
export function SessionsProvider({ children }) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSessions([])
      setIsLoading(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    db.fetchSessions().then((rows) => {
      if (!cancelled) {
        setSessions(rows)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user])

  const addSession = useCallback(
    async (session) => {
      const saved = await db.addSession(session, user.id)
      // Re-sort rather than just prepending: a backdated manual entry (or any
      // date other than "right now") would otherwise land at the top
      // regardless of its actual date, breaking newest-first order.
      setSessions((prev) => sortByDateDesc([saved, ...prev]))
      return saved
    },
    [user]
  )

  const updateSession = useCallback(async (id, changes) => {
    const saved = await db.updateSession(id, changes)
    // Re-sort here too — editing a session's date should move it to its
    // correct chronological position, not leave it in its old array slot.
    setSessions((prev) => sortByDateDesc(prev.map((s) => (s.id === id ? saved : s))))
    return saved
  }, [])

  const deleteSession = useCallback(async (id) => {
    await db.deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const refetch = useCallback(async () => {
    setSessions(await db.fetchSessions())
  }, [])

  return (
    <SessionsContext.Provider value={{ sessions, isLoading, addSession, updateSession, deleteSession, refetch }}>
      {children}
    </SessionsContext.Provider>
  )
}

export function useSessions() {
  const ctx = useContext(SessionsContext)
  if (!ctx) throw new Error("useSessions must be used within SessionsProvider")
  return ctx
}