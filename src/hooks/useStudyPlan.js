// src/hooks/useStudyPlan.js
import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import useSessions from "./useSessions"
import useLanguage from "./useLanguage"
import * as db from "../services/database"
import { CATEGORY_ICONS } from "../constants/activities"
import { generateDailyPlan, defaultWeights, DEFAULT_DAILY_MINUTES, DEFAULT_MAX_DAILY_TASKS } from "../utils/studyPlan"

const ALL_CATEGORIES = Object.keys(CATEGORY_ICONS)
const DEFAULT_SETTINGS = {
  dailyMinutesGoal: DEFAULT_DAILY_MINUTES,
  maxDailyTasks: DEFAULT_MAX_DAILY_TASKS,
  weights: defaultWeights(ALL_CATEGORIES),
}

function useStudyPlan() {
  const { user } = useAuth()
  const { sessions } = useSessions()
  const { currentLanguage } = useLanguage()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    if (!user) return
    db.getStudyPlanSettings(user.id).then((saved) => {
      setSettings(saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS)
    })
  }, [user])

  const saveSettings = useCallback(
    async (changes) => {
      const next = { ...settings, ...changes }
      setSettings(next) // optimistic — Plan Settings UI reflects it instantly
      if (user) await db.saveStudyPlanSettings(user.id, next)
    },
    [settings, user]
  )

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

  return { settings, todaysTasks, redistribution, excludedCategories, saveSettings, allCategories: ALL_CATEGORIES }
}

export default useStudyPlan