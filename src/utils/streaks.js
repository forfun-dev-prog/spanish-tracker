// src/utils/streaks.js
// Computes current and longest daily study streaks from a list of sessions.
// Shared by Stats and Achievements so the two pages can never disagree.
export function computeStreaks(sessions) {
  const sessionsDateSet = new Set(sessions.map((s) => new Date(s.date).toDateString()))

  if (sessionsDateSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0, sessionsDateSet }
  }

  const sortedDates = Array.from(sessionsDateSet)
    .map((d) => new Date(d))
    .sort((a, b) => a - b)

  let longestStreak = 0
  let tempStreak = 0
  let prevDate = null

  sortedDates.forEach((date) => {
    if (!prevDate) {
      tempStreak = 1
    } else {
      const diffDays = Math.round((date - prevDate) / 86400000)
      if (diffDays === 1) {
        tempStreak += 1
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) longestStreak = tempStreak
        tempStreak = 1
      }
    }
    prevDate = date
  })
  if (tempStreak > longestStreak) longestStreak = tempStreak

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const hasToday = sessionsDateSet.has(today.toDateString())
  const hasYesterday = sessionsDateSet.has(yesterday.toDateString())

  let currentStreak = 0
  if (hasToday || hasYesterday) {
    const checkDate = hasToday ? new Date(today) : new Date(yesterday)
    while (sessionsDateSet.has(checkDate.toDateString())) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  return { currentStreak, longestStreak, sessionsDateSet }
}

export default computeStreaks