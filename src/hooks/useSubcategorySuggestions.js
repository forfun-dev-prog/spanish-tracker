// src/hooks/useSubcategorySuggestions.js
import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import useSessions from "./useSessions"
import * as db from "../services/database"
import { rankSubcategorySuggestions } from "../utils/subcategorySuggestions"
import { filterSuggestions } from "../utils/detailSuggestions"

function useSubcategorySuggestions(category) {
  const { user } = useAuth()
  const { sessions } = useSessions()
  const [exclusions, setExclusions] = useState([])

  useEffect(() => {
    if (!user) return
    db.getSubcategoryExclusions(user.id, category).then(setExclusions)
  }, [user, category])

  const suggestions = useMemo(
    () => rankSubcategorySuggestions(sessions, category, exclusions),
    [sessions, category, exclusions]
  )

  const exclude = useCallback(
    async (text) => {
      if (!user) return
      await db.excludeSubcategorySuggestion(user.id, category, text)
      setExclusions((prev) => [...prev, text.trim().toLowerCase()])
    },
    [user, category]
  )

  return { suggestions, exclude, filterSuggestions }
}

export default useSubcategorySuggestions