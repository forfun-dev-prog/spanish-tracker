// src/hooks/useDetailSuggestions.js
import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import useSessions from "./useSessions"
import * as db from "../services/database"
import { rankDetailSuggestions, filterSuggestions } from "../utils/detailSuggestions"

function useDetailSuggestions(category) {
  const { user } = useAuth()
  const { sessions } = useSessions()
  const [exclusions, setExclusions] = useState([])

  useEffect(() => {
    if (!user) return
    db.getSuggestionExclusions(user.id, category).then(setExclusions)
  }, [user, category])

  const suggestions = useMemo(
    () => rankDetailSuggestions(sessions, category, exclusions),
    [sessions, category, exclusions]
  )

  const exclude = useCallback(
    async (text) => {
      if (!user) return
      await db.excludeSuggestion(user.id, category, text)
      setExclusions((prev) => [...prev, text.trim().toLowerCase()])
    },
    [user, category]
  )

  return { suggestions, exclude, filterSuggestions }
}

export default useDetailSuggestions