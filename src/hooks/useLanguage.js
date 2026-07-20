// src/hooks/useLanguage.js
import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import db, { selectLanguage } from "../services/database"
import { DEFAULT_LANGUAGE_CODE, getLanguage } from "../data/languages"

function useLanguage() {
  const codes = useLiveQuery(
    async () => {
      const row = await db.metadata.get("recentLanguages")
      return row?.value?.length ? row.value : [DEFAULT_LANGUAGE_CODE]
    },
    [],
    [DEFAULT_LANGUAGE_CODE]
  )

  const recentLanguages = useMemo(() => (codes || [DEFAULT_LANGUAGE_CODE]).map(getLanguage), [codes])
  const currentLanguage = recentLanguages[0] || getLanguage(DEFAULT_LANGUAGE_CODE)

  return { currentLanguage, recentLanguages, selectLanguage }
}

export default useLanguage