// src/utils/subcategorySuggestions.js
import { rankFieldSuggestions } from "./detailSuggestions"
import { DEFAULT_SUBCATEGORIES } from "../data/subcategories"

// History always outranks defaults — the seed list only fills in gaps so
// the picker isn't empty before someone has logged anything of that type.
export function rankSubcategorySuggestions(sessions, category, excluded = [], limit = 8) {
  const excludedSet = new Set(excluded.map((e) => e.trim().toLowerCase()))
  const historyRanked = rankFieldSuggestions(sessions, category, "subcategory", excluded, limit)

  const seen = new Set(historyRanked.map((s) => s.toLowerCase()))
  const merged = [...historyRanked]

  for (const fallback of DEFAULT_SUBCATEGORIES[category] || []) {
    if (merged.length >= limit) break
    const key = fallback.trim().toLowerCase()
    if (seen.has(key) || excludedSet.has(key)) continue
    merged.push(fallback)
    seen.add(key)
  }

  return merged
}