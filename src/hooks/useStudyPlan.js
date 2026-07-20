// src/hooks/useStudyPlan.js
import { useMemo } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import db, { saveStudyPlanSettings } from "../services/database"
import useSessions from "./useSessions"
import useLanguage from "./useLanguage"
import { CATEGORY_ICONS } from "../constants/activities"
import { generateDailyPlan, defaultWeights, DEFAULT_DAILY_MINUTES, DEFAULT_MAX_DAILY_TASKS } from "../utils/studyPlan"

const ALL_CATEGORIES = Object.keys(CATEGORY_ICONS)

const DEFAULT_SETTINGS = {
  dailyMinutesGoal: DEFAULT_DAILY_MINUTES,
  maxDailyTasks: DEFAULT_MAX_DAILY_TASKS,
  weights: defaultWeights(ALL_CATEGORIES),
}

function useStudyPlan() {
  const { sessions } = useSessions()
  const { currentLanguage } = useLanguage()

  // Merges saved settings over the defaults so older saved settings (from
  // before maxDailyTasks existed) still work without a migration step.
  const settings = useLiveQuery(
    async () => {
      const row = await db.metadata.get("studyPlanSettings")
      return row?.value ? { ...DEFAULT_SETTINGS, ...row.value } : DEFAULT_SETTINGS
    },
    [],
    DEFAULT_SETTINGS
  )

  // Scoped to the current language. Sessions logged before language tagging
  // existed still count — only an explicit mismatch excludes them.
  const languageSessions = useMemo(
    () => sessions.filter((s) => !s.language || s.language === currentLanguage.code),
    [sessions, currentLanguage]
  )

  const { tasks, redistribution } = useMemo(
    () =>
      generateDailyPlan({
        weights: settings.weights,
        dailyMinutesGoal: settings.dailyMinutesGoal,
        maxDailyTasks: settings.maxDailyTasks,
        allCategories: ALL_CATEGORIES,
        sessions: languageSessions,
      }),
    [settings, languageSessions]
  )

  // Today's progress per task is computed separately from selection, so
  // logging a session updates the checkbox live without reshuffling the list.
  const todaysTasks = useMemo(() => {
    const todayKey = new Date().toDateString()
    return tasks.map((task) => {
      const actualMinutes = languageSessions
        .filter((s) => task.categories.includes(s.category) && new Date(s.date).toDateString() === todayKey)
        .reduce((sum, s) => sum + s.duration / 60, 0)
      return { ...task, actualMinutes, done: task.targetMinutes > 0 && actualMinutes >= task.targetMinutes }
    })
  }, [tasks, languageSessions])

  const excludedCategories = ALL_CATEGORIES.filter((c) => (settings.weights[c] ?? 0) === 0)

  const saveSettings = (changes) => saveStudyPlanSettings({ ...settings, ...changes })

  return {
    settings,
    todaysTasks,
    redistribution,
    excludedCategories,
    saveSettings,
    allCategories: ALL_CATEGORIES,
  }
}

export default useStudyPlan