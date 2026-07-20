// src/services/database.js
import Dexie from "dexie"
import { DEFAULT_LANGUAGE_CODE } from "../data/languages"

const db = new Dexie("LanguageAnalytics")

db.version(1).stores({
  sessions: "++id,date,category,duration",
  metadata: "key,value",
})

// --- CORE CRUD Operations ---
export async function addSession(session) {
  return await db.sessions.add(session)
}

export async function getSessions() {
  return await db.sessions.toArray()
}

export async function updateSession(id, changes) {
  await db.sessions.update(id, changes)
}

export async function deleteSession(id) {
  await db.sessions.delete(id)
}

// --- Detail Suggestion Exclusions ---
// "Hides" a specific details value from future suggestion chips/autocomplete
// for a category (e.g. to fix a typo that keeps reappearing). This never
// touches past session records — only what gets suggested going forward.
export async function getSuggestionExclusions(category) {
  try {
    const row = await db.metadata.get("suggestionExclusions")
    const map = row?.value || {}
    return map[category] || []
  } catch (e) {
    console.error("Error reading suggestion exclusions:", e)
    return []
  }
}

export async function excludeSuggestion(category, detailText) {
  try {
    const row = await db.metadata.get("suggestionExclusions")
    const map = row?.value || {}
    const normalized = detailText.trim().toLowerCase()
    const set = new Set(map[category] || [])
    set.add(normalized)
    map[category] = Array.from(set)
    await db.metadata.put({ key: "suggestionExclusions", value: map })
  } catch (e) {
    console.error("Error excluding suggestion:", e)
  }
}

// --- Language Selection ---
// The "current language" IS just the front of this list — no separate
// pointer to keep in sync. Persisted, so it's remembered across reloads;
// capped at 3 so polyglots get quick one-tap access to their recent set.
export async function getRecentLanguageCodes() {
  try {
    const row = await db.metadata.get("recentLanguages")
    return row?.value?.length ? row.value : [DEFAULT_LANGUAGE_CODE]
  } catch (e) {
    console.error("Error reading recent languages:", e)
    return [DEFAULT_LANGUAGE_CODE]
  }
}

export async function selectLanguage(code) {
  try {
    const row = await db.metadata.get("recentLanguages")
    const current = row?.value || []
    const next = [code, ...current.filter((c) => c !== code)].slice(0, 3)
    await db.metadata.put({ key: "recentLanguages", value: next })
  } catch (e) {
    console.error("Error selecting language:", e)
  }
}

// --- DEV TOOL: Clear All Data ---
// Wipes every session and every metadata entry. No undo. Remove the UI
// button for this once the app is tracking real study hours.
export async function clearAllData() {
  try {
    await db.transaction("rw", db.sessions, db.metadata, async () => {
      await db.sessions.clear()
      await db.metadata.clear()
    })
  } catch (e) {
    console.error("clearAllData failed:", e)
  }
}

export default db