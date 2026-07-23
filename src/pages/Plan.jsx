import { useState, useEffect } from "react"
import useStudyPlan from "../hooks/useStudyPlan"
import { ACTIVITY_COLORS, CATEGORY_ICONS } from "../constants/activities"

const cardStyle = {
  background: "rgba(15, 10, 30, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: 20,
  padding: 24,
  marginBottom: 28,
}

const cardTitleStyle = {
  textAlign: "center",
  margin: "0 0 20px 0",
  fontSize: 18,
  color: "#ffffff",
}

const WEIGHT_OPTIONS = [0, 1, 2, 3, 4, 5]
const TASK_COUNT_OPTIONS = [1, 2, 3, 4, 5]

const CATCHING_UP_EXPLANATION =
  "This activity has gotten less than half its usual share of study time over the past week, so it's been prioritized today to help it catch up."

function WeightRow({ category, weight, onChange }) {
  const isExcluded = weight === 0
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        opacity: isExcluded ? 0.55 : 1,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, minWidth: 0 }}>
        <span>{CATEGORY_ICONS[category]}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{category}</span>
        {isExcluded && (
          <span style={{ fontSize: 10, fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Excluded
          </span>
        )}
      </span>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {WEIGHT_OPTIONS.map((val) => {
          const active = weight === val
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              title={val === 0 ? "Exclude from plan" : `Priority ${val}`}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                background: active ? (val === 0 ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)") : "rgba(255,255,255,0.04)",
                border: active ? `1px solid ${val === 0 ? "#f87171" : "#818cf8"}` : "1px solid rgba(255,255,255,0.08)",
                color: "#f8fafc",
              }}
            >
              {val}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Plan() {
  const { settings, todaysTasks, redistribution, excludedCategories, saveSettings, allCategories } = useStudyPlan()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [goalInput, setGoalInput] = useState(String(settings.dailyMinutesGoal))
  // Tracks which tasks' "Catching up" explanation is expanded. A Set instead
  // of a single value so more than one can be open if someone taps a few.
  const [expandedTaskIds, setExpandedTaskIds] = useState(() => new Set())

  useEffect(() => {
    setGoalInput(String(settings.dailyMinutesGoal))
  }, [settings.dailyMinutesGoal])

  const toggleExpanded = (id) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalTarget = todaysTasks.reduce((sum, t) => sum + t.targetMinutes, 0)
  const totalActual = todaysTasks.reduce((sum, t) => sum + t.actualMinutes, 0)

  const handleWeightChange = (category, value) => {
    saveSettings({ weights: { ...settings.weights, [category]: value } })
  }

  const handleGoalBlur = () => {
    const parsed = Number(goalInput)
    if (parsed > 0) {
      saveSettings({ dailyMinutesGoal: Math.round(parsed) })
    } else {
      setGoalInput(String(settings.dailyMinutesGoal))
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "32px 24px", background: "#0f0a1e", color: "#f8fafc", borderRadius: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", margin: "0 0 6px 0" }}>🗓️ Study Plan</h1>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0, fontWeight: 500 }}>
          What to study next, based on your priorities and recent activity
        </p>
      </div>

      {/* Settings — collapsed by default; not something you touch every visit */}
      <div style={cardStyle}>
        <button
          type="button"
          onClick={() => setIsSettingsOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "none",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: 0,
            marginBottom: isSettingsOpen ? 20 : 0,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700 }}>⚙️ Plan Settings</span>
          <span style={{ fontSize: 12, color: "#a5b4fc" }}>{isSettingsOpen ? "Hide ▲" : "Show ▼"}</span>
        </button>

        {isSettingsOpen && (
          <>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Daily study goal
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onBlur={handleGoalBlur}
                  style={{
                    width: 90,
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    fontSize: 15,
                    textAlign: "center",
                    color: "#f8fafc",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>minutes / day</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Max tasks per day
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {TASK_COUNT_OPTIONS.map((n) => {
                  const active = settings.maxDailyTasks === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => saveSettings({ maxDailyTasks: n })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer",
                        background: active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.04)",
                        border: active ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.08)",
                        color: "#f8fafc",
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Priority per activity
              </label>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px 0" }}>
                Each day picks the top few activities by priority and how overdue they are — not every included activity shows up daily. 0 excludes one entirely; that time flows into Listening/Watching/Reading instead.
              </p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {allCategories.map((cat) => (
                  <div key={cat} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <WeightRow
                      category={cat}
                      weight={settings.weights[cat] ?? 3}
                      onChange={(val) => handleWeightChange(cat, val)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Today's Plan — a short, focused list, not one row per category */}
      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Today's Plan</h3>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#94a3b8", fontWeight: 600 }}>Overall progress</span>
            <span style={{ color: "#f8fafc", fontWeight: 700 }}>
              {Math.round(totalActual)} / {totalTarget} min
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${totalTarget > 0 ? Math.min((totalActual / totalTarget) * 100, 100) : 0}%`,
                background: "linear-gradient(90deg,#6366f1,#a855f7)",
                borderRadius: 4,
                transition: ".3s",
              }}
            />
          </div>
        </div>

        {redistribution && (
          <div
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              color: "#a7f3d0",
              marginBottom: 18,
            }}
          >
            🌱 {redistribution.excludedCategories.join(", ")} excluded — that time flows into{" "}
            {redistribution.boostedUnits.join(", ")} instead.
          </div>
        )}

        {todaysTasks.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 13 }}>
            Every activity is excluded — open Plan Settings above to include at least one.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {todaysTasks.map((task) => {
              const pct = task.targetMinutes > 0 ? Math.min((task.actualMinutes / task.targetMinutes) * 100, 100) : 0
              const barColor = ACTIVITY_COLORS[task.categories[0]] || "#6366f1"
              const icons = task.categories.map((c) => CATEGORY_ICONS[c]).join("")
              const showBadge = task.isCatchingUp && !task.done
              const isExpanded = expandedTaskIds.has(task.id)

              return (
                <div key={task.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      marginTop: 1,
                      borderRadius: 7,
                      border: `1px solid ${task.done ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
                      background: task.done ? "#22c55e" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#0f172a",
                      fontWeight: 900,
                    }}
                  >
                    {task.done ? "✓" : ""}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Label + minutes share a line but wrap onto two if
                        needed, instead of the label getting truncated. */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", rowGap: 2, columnGap: 8, marginBottom: showBadge ? 6 : 5 }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 800,
                          fontSize: 14,
                          color: task.done ? "#94a3b8" : "#f8fafc",
                          textDecoration: task.done ? "line-through" : "none",
                        }}
                      >
                        <span>{icons}</span>
                        <span>{task.label}</span>
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 13, flexShrink: 0 }}>
                        {Math.round(task.actualMinutes)}/{task.targetMinutes} min
                      </span>
                    </div>

                    {/* Catching up gets its own line, and is now tap-to-expand
                        rather than hover-only, since a native tooltip never
                        fires on a touchscreen. */}
                    {showBadge && (
                      <div style={{ marginBottom: 6 }}>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(task.id)}
                          title={CATCHING_UP_EXPLANATION}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10,
                            fontWeight: 800,
                            color: "#fbbf24",
                            background: "rgba(251,191,36,0.12)",
                            border: "none",
                            padding: "3px 8px",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          ⏳ Catching up
                          <span style={{ fontSize: 9, opacity: 0.8 }}>{isExpanded ? "▲" : "ⓘ"}</span>
                        </button>
                        {isExpanded && (
                          <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 2px 0 2px", lineHeight: 1.4 }}>
                            {CATCHING_UP_EXPLANATION}
                          </p>
                        )}
                      </div>
                    )}

                    <div style={{ height: 7, borderRadius: 3.5, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3.5 }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {excludedCategories.length > 0 && (
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 18, textAlign: "center" }}>
            Permanently excluded: {excludedCategories.join(", ")}
          </p>
        )}
      </div>
    </div>
  )
}

export default Plan