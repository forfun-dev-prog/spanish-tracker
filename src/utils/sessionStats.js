// Shared helpers for turning raw session records into day-by-day
// aggregates, used by both the habit grid and the trend graph.

function toDateKey(d) {
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Returns a Map keyed by "yyyy-MM-dd" (local time) -> total minutes
// studied that day, across all categories combined.
export function getDailyTotals(sessions) {
  const totals = new Map()

  for (const session of sessions) {
    const key = toDateKey(new Date(session.date))
    const minutes = session.duration / 60
    totals.set(key, (totals.get(key) || 0) + minutes)
  }

  return totals
}

// Returns an array of { date: "yyyy-MM-dd", minutes } covering the last
// `days` days (inclusive of today), in chronological order. Days with
// no sessions are included with minutes: 0, so the series has no gaps.
export function getDailySeries(sessions, days = 84) {
  const totals = getDailyTotals(sessions)
  const series = []

  const today = new Date()
  // Setting the clock to local noon absorbs any 1-hour DST offset shifts
  today.setHours(12, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = toDateKey(d)

    series.push({
      date: key,
      minutes: Math.round((totals.get(key) || 0) * 10) / 10,
    })
  }

  return series
}