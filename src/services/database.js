// src/services/database.js
import { supabase } from "./supabaseClient"

// --- Sessions ---
export async function fetchSessions() {
  const { data, error } = await supabase.from("sessions").select("*").order("date", { ascending: false })
  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }
  return data
}

export async function addSession(session, userId) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ ...session, user_id: userId })
    .select()
    .single()
  if (error) {
    console.error("Error adding session:", error)
    throw error
  }
  return data
}

export async function updateSession(id, changes) {
  const { data, error } = await supabase.from("sessions").update(changes).eq("id", id).select().single()
  if (error) {
    console.error("Error updating session:", error)
    throw error
  }
  return data
}

export async function deleteSession(id) {
  const { error } = await supabase.from("sessions").delete().eq("id", id)
  if (error) {
    console.error("Error deleting session:", error)
    throw error
  }
}

// --- Generic per-user metadata (mirrors the old Dexie key/value table) ---
async function getMetadata(userId, key) {
  const { data, error } = await supabase
    .from("metadata")
    .select("value")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle()
  if (error) {
    console.error(`Error reading metadata "${key}":`, error)
    return null
  }
  return data?.value ?? null
}

async function setMetadata(userId, key, value) {
  const { error } = await supabase.from("metadata").upsert({ user_id: userId, key, value })
  if (error) {
    console.error(`Error saving metadata "${key}":`, error)
  }
}

// --- Detail Suggestion Exclusions ---
export async function getSuggestionExclusions(userId, category) {
  const map = (await getMetadata(userId, "suggestionExclusions")) || {}
  return map[category] || []
}

export async function excludeSuggestion(userId, category, detailText) {
  const map = (await getMetadata(userId, "suggestionExclusions")) || {}
  const normalized = detailText.trim().toLowerCase()
  const set = new Set(map[category] || [])
  set.add(normalized)
  map[category] = Array.from(set)
  await setMetadata(userId, "suggestionExclusions", map)
}

// --- Subcategory Suggestion Exclusions ---
// Kept as a separate metadata key from the details exclusions above, since
// hiding a mistyped subcategory ("Podcst") shouldn't have anything to do
// with hiding a mistyped note.
export async function getSubcategoryExclusions(userId, category) {
  const map = (await getMetadata(userId, "subcategorySuggestionExclusions")) || {}
  return map[category] || []
}

export async function excludeSubcategorySuggestion(userId, category, text) {
  const map = (await getMetadata(userId, "subcategorySuggestionExclusions")) || {}
  const normalized = text.trim().toLowerCase()
  const set = new Set(map[category] || [])
  set.add(normalized)
  map[category] = Array.from(set)
  await setMetadata(userId, "subcategorySuggestionExclusions", map)
}

// --- Language Selection ---
export async function getRecentLanguageCodes(userId, defaultCode) {
  const codes = await getMetadata(userId, "recentLanguages")
  return codes?.length ? codes : [defaultCode]
}

export async function selectLanguage(userId, code) {
  const current = (await getMetadata(userId, "recentLanguages")) || []
  const next = [code, ...current.filter((c) => c !== code)].slice(0, 3)
  await setMetadata(userId, "recentLanguages", next)
}

// --- Study Plan Settings ---
export async function getStudyPlanSettings(userId) {
  return await getMetadata(userId, "studyPlanSettings")
}

export async function saveStudyPlanSettings(userId, settings) {
  await setMetadata(userId, "studyPlanSettings", settings)
}

// --- DEV TOOL: Clear All Data ---
export async function clearAllData(userId) {
  await supabase.from("sessions").delete().eq("user_id", userId)
  await supabase.from("metadata").delete().eq("user_id", userId)
}