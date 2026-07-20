// src/pages/History.jsx
import { useState } from "react"
import useSessions from "../hooks/useSessions"
import SessionForm from "../components/SessionForm"
import Modal from "../components/Modal"
import { useReward } from "../components/RewardCelebration"
import { getDifficultyMeta } from "../components/OptionalSessionDetails"
import { ACTIVITY_COLORS } from "../constants/activities"
import { clearAllData } from "../services/database"

function History() {
  const { sessions, addSession, updateSession, deleteSession } = useSessions()
  const celebrate = useReward()

  const [editingSession, setEditingSession] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const openAdd = () => {
    setEditingSession(null)
    setIsFormOpen(true)
  }

  const openEdit = (session) => {
    setEditingSession(session)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSession(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this session? This can't be undone.")) {
      await deleteSession(id)
    }
  }

  const handleSave = async (data) => {
    if (data.id) {
      const { id, ...changes } = data
      await updateSession(id, changes) // editing does not award tokens
    } else {
      const result = await addSession(data)
      if (result && result.tokensEarned > 0) {
        celebrate({
          title: `+${result.tokensEarned} Spin Token${result.tokensEarned > 1 ? "s" : ""}`,
          subtitle: result.message,
        })
      }
    }
    closeForm()
  }

  // Temporary dev tool — wipes sessions, tokens, coins, and owned bears.
  // Remove this button once the app is being used to track real hours.
  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      "This permanently deletes ALL sessions, tokens, coins, and teddy bears. There is no undo. Continue?"
    )
    if (!confirmed) return
    await clearAllData()
  }

  const formatMinutes = (seconds) => Math.round(seconds / 60)

  const formatDate = (isoString) => {
    const d = new Date(isoString)
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getActivityColor = (category) => ACTIVITY_COLORS[category] || "#6366f1"

  return (
    <div
      style={{
        maxWidth: "550px",
        margin: "20px auto",
        padding: "24px",
        background: "radial-gradient(circle, #1a103c 0%, #090514 100%)",
        color: "#f8fafc",
        borderRadius: "28px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 40px rgba(139, 92, 246, 0.15)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "900", margin: "0", color: "#ffffff" }}>📚 Study History</h2>
          <span style={{ fontSize: "13px", color: "#a5b4fc" }}>
            Total: {sessions.length} {sessions.length === 1 ? "session logged" : "sessions logged"}
          </span>
        </div>
        <button
          onClick={openAdd}
          style={{
            padding: "10px 16px",
            fontSize: "13px",
            fontWeight: "800",
            backgroundColor: "#fbbf24",
            color: "#0f172a",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(251,191,36,0.3)",
            textTransform: "uppercase",
          }}
        >
          + Session
        </button>
      </div>

      <hr style={{ borderColor: "rgba(255,255,255,0.06)", marginBottom: "20px" }} />

      {/* Session list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "500px", overflowY: "auto", paddingRight: "4px" }}>
        {sessions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "40px 0" }}>
            No logged items found yet. Start hitting the timers!
          </p>
        ) : (
          sessions.map((session) => {
            const accentColor = getActivityColor(session.category)
            const difficultyMeta = getDifficultyMeta(session.difficulty)
            return (
              <div
                key={session.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderLeft: `5px solid ${accentColor}`,
                  borderRadius: "16px",
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.2s",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "800", color: "#ffffff" }}>
                    {session.category}
                  </h4>
                  <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "#94a3b8", flexWrap: "wrap" }}>
                    <span style={{ color: accentColor, fontWeight: "700" }}>⏱️ {formatMinutes(session.duration)} min</span>
                    <span>•</span>
                    <span>📅 {formatDate(session.date)}</span>
                    {difficultyMeta && (
                      <span title={difficultyMeta.label}>
                        {difficultyMeta.emoji} {difficultyMeta.label}
                      </span>
                    )}
                  </div>
                  {session.details && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#a5b4fc",
                        fontStyle: "italic",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={session.details}
                    >
                      “{session.details}”
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(session)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      color: "#cbd5e1",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "700",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      color: "#f87171",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* --- TEMPORARY DEV TOOL — remove before real use --- */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px dashed rgba(239,68,68,0.35)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, textAlign: "center" }}>
          ⚠️ Danger Zone — Dev Only
        </div>
        <button
          onClick={handleClearAllData}
          style={{
            width: "100%",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: "800",
            color: "#ffffff",
            backgroundColor: "#dc2626",
            border: "1px solid #ef4444",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(220,38,38,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          🗑️ Clear All Data
        </button>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 8, textAlign: "center" }}>
          Wipes every session, token, coin, and teddy bear. Remove this button before tracking real hours.
        </p>
      </div>

      {/* Add / Edit modal */}
      {isFormOpen && (
        <Modal onClose={closeForm}>
          <SessionForm session={editingSession} onSave={handleSave} onCancel={closeForm} />
        </Modal>
      )}
    </div>
  )
}

export default History