// src/context/LanguageContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useAuth } from "./AuthContext"
import * as db from "../services/database"
import { DEFAULT_LANGUAGE_CODE, getLanguage } from "../data/languages"

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const { user } = useAuth()
  const [codes, setCodes] = useState([DEFAULT_LANGUAGE_CODE])

  useEffect(() => {
    if (!user) {
      setCodes([DEFAULT_LANGUAGE_CODE])
      return
    }
    db.getRecentLanguageCodes(user.id, DEFAULT_LANGUAGE_CODE).then(setCodes)
  }, [user])

  const selectLanguage = useCallback(
    async (code) => {
      if (!user) return
      await db.selectLanguage(user.id, code)
      setCodes((prev) => [code, ...prev.filter((c) => c !== code)].slice(0, 3))
    },
    [user]
  )

  const recentLanguages = useMemo(() => codes.map(getLanguage), [codes])
  const currentLanguage = recentLanguages[0] || getLanguage(DEFAULT_LANGUAGE_CODE)

  return (
    <LanguageContext.Provider value={{ currentLanguage, recentLanguages, selectLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}