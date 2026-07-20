// src/utils/studyPlan.js
// Picks a handful of focused daily tasks instead of splitting the time
// budget thinly across every category.

// Receptive categories — when an explicit-practice category (e.g. Grammar)
// is excluded, its freed weight flows here instead of spreading evenly
// across whatever's left.
export const COMPREHENSIBLE_INPUT_CATEGORIES = ["Listening", "Watching", "Reading"]

// Categories that can interchangeably satisfy one combined task (e.g. "30
// min of Listening or Watching" — either counts). Keeps near-equivalent
// input modes from competing for two of your limited daily task slots.
export const FLEX_GROUPS = [{ id: "av_input", categories: ["Listening", "Watching"] }]

const REDISTRIBUTION_UNIT = 3
const HISTORY_WINDOW_DAYS = 7

export const DEFAULT_WEIGHT = 3
export const DEFAULT_DAILY_MINUTES = 30
export const DEFAULT_MAX_DAILY_TASKS = 3

export function defaultWeights(categories) {
  return Object.fromEntries(categories.map((c) => [c, DEFAULT_WEIGHT]))
}

// Merges flex-group categories into single "units"; every other included
// category becomes its own unit. A category at weight 0 never appears, even
// as a member of a flex group whose other category is included (if only one
// member of a group survives, it just becomes a plain singleton task).
function buildTaskUnits(weights, allCategories) {
  const grouped = new Set(FLEX_GROUPS.flatMap((g) => g.categories))
  const units = []

  FLEX_GROUPS.forEach((group) => {
    const included = group.categories.filter((c) => (weights[c] ?? 0) > 0)
    if (included.length === 0) return
    units.push({
      id: group.id,
      categories: included,
      label: included.join(" or "),
      weight: Math.max(...included.map((c) => weights[c] ?? 0)),
    })
  })

  allCategories.forEach((cat) => {
    if (grouped.has(cat)) return
    const weight = weights[cat] ?? 0
    if (weight <= 0) return
    units.push({ id: cat, categories: [cat], label: cat, weight })
  })

  return units
}

function sumMinutes(sessions, categories, fromDate, toDate) {
  return sessions.reduce((sum, s) => {
    if (!categories.includes(s.category)) return sum
    const d = new Date(s.date)
    if (d < fromDate || d >= toDate) return sum
    return sum + s.duration / 60
  }, 0)
}

// Builds today's task list. Ranks every included unit by how far behind its
// weighted "fair share" it's fallen over the last 7 days (NOT including
// today — see note below), then keeps only the top `maxDailyTasks`,
// splitting the daily goal across just those, proportional to weight.
//
// Excluding today from the ranking window is deliberate: if today's own
// in-progress minutes fed back into the deficit calculation, finishing part
// of a task could shrink its deficit enough to bump it out of the list
// mid-day. Freezing the selection on prior days keeps today's task list
// stable all day; only each task's progress bar (computed separately, from
// today's sessions) updates live.
export function generateDailyPlan({ weights, dailyMinutesGoal, maxDailyTasks, allCategories, sessions, now = new Date() }) {
  const excluded = allCategories.filter((c) => (weights[c] ?? 0) === 0)
  const units = buildTaskUnits(weights, allCategories)

  if (units.length === 0 || !dailyMinutesGoal || dailyMinutesGoal <= 0) {
    return { tasks: [], redistribution: null }
  }

  const ciUnits = units.filter((u) => u.categories.some((c) => COMPREHENSIBLE_INPUT_CATEGORIES.includes(c)))
  const bonusPool = excluded.length * REDISTRIBUTION_UNIT
  const bonusPerCiUnit = ciUnits.length > 0 ? bonusPool / ciUnits.length : 0

  const effectiveWeight = new Map(units.map((u) => [u.id, u.weight + (ciUnits.includes(u) ? bonusPerCiUnit : 0)]))
  const totalWeight = Array.from(effectiveWeight.values()).reduce((a, b) => a + b, 0)

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const windowStart = new Date(todayStart)
  windowStart.setDate(windowStart.getDate() - HISTORY_WINDOW_DAYS)

  const ranked = units
    .map((u) => {
      const weeklyActual = sumMinutes(sessions, u.categories, windowStart, todayStart)
      const expectedShare = (effectiveWeight.get(u.id) / totalWeight) * dailyMinutesGoal * HISTORY_WINDOW_DAYS
      return { ...u, effectiveWeight: effectiveWeight.get(u.id), weeklyActual, expectedShare, deficit: expectedShare - weeklyActual }
    })
    .sort((a, b) => b.deficit - a.deficit || b.effectiveWeight - a.effectiveWeight)

  const chosen = ranked.slice(0, Math.max(1, maxDailyTasks))
  const chosenWeightTotal = chosen.reduce((sum, u) => sum + u.effectiveWeight, 0)

  const raw = chosen.map((u) => {
    const exact = (u.effectiveWeight / chosenWeightTotal) * dailyMinutesGoal
    return { ...u, minutes: Math.floor(exact), remainder: exact - Math.floor(exact) }
  })

  let usedMinutes = raw.reduce((sum, r) => sum + r.minutes, 0)
  let remaining = dailyMinutesGoal - usedMinutes
  const sortedByRemainder = [...raw].sort((a, b) => b.remainder - a.remainder)
  for (let i = 0; i < remaining; i++) {
    sortedByRemainder[i % sortedByRemainder.length].minutes += 1
  }

  const tasks = raw.map((u) => ({
    id: u.id,
    label: u.label,
    categories: u.categories,
    targetMinutes: u.minutes,
    // Flags a task that's under half its due share — a lightweight signal
    // that it was picked because it's lagging, not just because it's your
    // top-weighted category today.
    isCatchingUp: u.weeklyActual < u.expectedShare * 0.5,
  }))

  const redistribution =
    excluded.length > 0 && ciUnits.length > 0
      ? { excludedCategories: excluded, boostedUnits: ciUnits.map((u) => u.label) }
      : null

  return { tasks, redistribution }
}