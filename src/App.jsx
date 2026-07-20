// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom"
import { useState } from "react"

import TimerCard from "./components/TimerCard"
import CategorySelector from "./components/CategorySelector"
import SessionForm from "./components/SessionForm"
import Modal from "./components/Modal"
import LanguageSwitcher from "./components/LanguageSwitcher"
import History from "./pages/History"
import Stats from "./pages/Stats"
import Shop from "./pages/Shop"
import Achievements from "./pages/Achievements"
import RewardWheel from "./components/RewardWheel"
import { RewardProvider, useReward } from "./components/RewardCelebration"
import useSessions from "./hooks/useSessions"
import useLanguage from "./hooks/useLanguage"

// Styled Navigation Component to detect the active route
function PremiumNavBar() {
  const location = useLocation()

  const getLinkStyle = (path, isSpecial = false) => {
    const isActive = location.pathname === path

    return {
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "800",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      padding: "8px 16px",
      borderRadius: "10px",
      transition: "all 0.2s ease-in-out",

      ...(isSpecial
        ? {
            color: "#fbbf24",
            background: isActive ? "rgba(251, 191, 36, 0.15)" : "transparent",
            border: isActive ? "1px solid #fbbf24" : "1px solid rgba(251, 191, 36, 0.3)",
            boxShadow: isActive ? "0 0 12px rgba(251, 191, 36, 0.2)" : "none",
          }
        : {
            color: isActive ? "#ffffff" : "#94a3b8",
            background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
            border: "1px solid transparent",
          }),
    }
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        padding: "16px 20px",
        backgroundColor: "#090514",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Link to="/" style={getLinkStyle("/")}>Home</Link>
      <Link to="/history" style={getLinkStyle("/history")}>History</Link>
      <Link to="/stats" style={getLinkStyle("/stats")}>Stats</Link>
      <Link to="/achievements" style={getLinkStyle("/achievements")}>🏆 Badges</Link>
      <Link to="/shop" style={getLinkStyle("/shop")}>🧸 Shop</Link>
      <Link to="/casino" style={getLinkStyle("/casino", true)}>🎰 Casino</Link>
    </nav>
  )
}

function Dashboard() {
  const [category, setCategory] = useState("Listening")
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { currentLanguage } = useLanguage()

  // Token-aware session creator, shared by both the timer's Save button and
  // this page's manual "+ Add Session" button.
  const { addSession } = useSessions()
  const celebrate = useReward()

  const handleManualSave = async (data) => {
    const result = await addSession(data)
    if (result && result.tokensEarned > 0) {
      celebrate({
        title: `+${result.tokensEarned} Spin Token${result.tokensEarned > 1 ? "s" : ""}`,
        subtitle: result.message,
      })
    }
    setIsAddOpen(false)
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "32px 24px",
        background: "radial-gradient(circle, #1a103c 0%, #090514 100%)",
        color: "#f8fafc",
        borderRadius: "28px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(139, 92, 246, 0.15)",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "900",
          textAlign: "center",
          margin: "0 0 8px 0",
          letterSpacing: "0.5px",
          color: "#ffffff",
          textShadow: "0px 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <span style={{ marginRight: "10px" }}>{currentLanguage.flag}</span>Language Tracker
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#a5b4fc",
          fontSize: "14px",
          margin: "0 0 20px 0",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Optimize your daily learning flow
      </p>

      {/* Studying more than one language? Switch here — it's remembered for
          next time, and the timer below tags every session with it. */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <LanguageSwitcher label="Studying" />
      </div>

      {/* The two main actions of the app, both visible immediately:
          time a session live below, or log one manually right here. */}
      <button
        onClick={() => setIsAddOpen(true)}
        style={{
          display: "block",
          width: "100%",
          padding: "12px 18px",
          marginBottom: "24px",
          fontSize: "14px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "#0f172a",
          background: "#fbbf24",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          boxShadow: "0 6px 15px rgba(251,191,36,0.3)",
        }}
      >
        + Add Session
      </button>

      <CategorySelector selectedCategory={category} setSelectedCategory={setCategory} />
      <TimerCard category={category} onSaveSession={addSession} />

      {isAddOpen && (
        <Modal onClose={() => setIsAddOpen(false)}>
          <SessionForm session={null} onSave={handleManualSave} onCancel={() => setIsAddOpen(false)} />
        </Modal>
      )}
    </div>
  )
}

function App() {
  return (
    <RewardProvider>
      <BrowserRouter>
        <PremiumNavBar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/casino" element={<RewardWheel />} />
        </Routes>
      </BrowserRouter>
    </RewardProvider>
  )
}

export default App