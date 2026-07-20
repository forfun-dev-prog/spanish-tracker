// src/hooks/useDetailSuggestions.js
import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import db, { excludeSuggestion } from "../services/database"
import useSessions from "./useSessions"
import { rankDetailSuggestions, filterSuggestions } from "../utils/detailSuggestions"

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