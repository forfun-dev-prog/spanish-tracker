// src/utils/detailSuggestions.js
// Derives "what did you call this before" suggestions purely from session
// history — no predefined list, no separate content database.

// Ranks distinct values of `field` used within a category. Score blends
// frequency with recency so something logged often *and* recently outranks
// a one-off from months back.
export function rankFieldSuggestions(sessions, category, field, excluded = [], limit = 8) {
  const excludedSet = new Set(excluded.map((e) => e.trim().toLowerCase()))
  const now = Date.now()
  const scored = new Map() // normalized key -> { text, score, lastDate }

  sessions.forEach((s) => {
    if (s.category !== category) return
    const raw = (s[field] || "").trim()
    if (!raw) return

    const key = raw.toLowerCase()
    if (excludedSet.has(key)) return

    const sessionDate = new Date(s.date)
    const daysAgo = Math.max((now - sessionDate.getTime()) / 86400000, 0)
    const weight = 1 / (1 + daysAgo / 30) // ~half weight at 30 days old

    const existing = scored.get(key)
    if (existing) {
      existing.score += weight
      if (sessionDate > existing.lastDate) {
        existing.text = raw // keep the most recently-used casing/spelling
        existing.lastDate = sessionDate
      }
    } else {
      scored.set(key, { text: raw, score: weight, lastDate: sessionDate })
    }
  })

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ text }) => text)
}

// Back-compat wrapper — existing callers asking for `details` suggestions
// don't need to change.
export function rankDetailSuggestions(sessions, category, excluded = [], limit = 8) {
  return rankFieldSuggestions(sessions, category, "details", excluded, limit)
}

// Filters an already-ranked suggestion list by what's currently typed,
// excluding an exact (case-insensitive) match since there's nothing to
// autocomplete toward at that point.
export function filterSuggestions(suggestions, query) {
  const q = query.trim().toLowerCase()
  if (!q) return suggestions
  return suggestions.filter((s) => {
    const lower = s.toLowerCase()
    return lower.includes(q) && lower !== q
  })
}