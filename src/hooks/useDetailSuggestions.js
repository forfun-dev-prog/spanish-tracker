// src/hooks/useDetailSuggestions.js
import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import db, { excludeSuggestion } from "../services/database"
import useSessions from "./useSessions"
import { rankDetailSuggestions, filterSuggestions } from "../utils/detailSuggestions"

// Ranked "what did you call this before" suggestions for a category, derived
// entirely from the person's own session history. No predefined content
// list, no new session fields — it grows richer the more they log.
function useDetailSuggestions(category) {
  const { sessions } = useSessions()

  const exclusions = useLiveQuery(
    async () => {
      const row = await db.metadata.get("suggestionExclusions")
      const map = row?.value || {}
      return map[category] || []
    },
    [category],
    []
  )

  const suggestions = useMemo(
    () => rankDetailSuggestions(sessions, category, exclusions || []),
    [sessions, category, exclusions]
  )

  const exclude = (text) => excludeSuggestion(category, text)

  return { suggestions, exclude, filterSuggestions }
}

export default useDetailSuggestions