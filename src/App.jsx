// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom"
import { useState } from "react"

import TimerCard from "./components/TimerCard"
import CategorySelector from "./components/CategorySelector"
import History from "./pages/History"
import Stats from "./pages/Stats"
import Shop from "./pages/Shop"
import Achievements from "./pages/Achievements"
import RewardWheel from "./components/RewardWheel"
import { RewardProvider } from "./components/RewardCelebration"
import useSessions from "./hooks/useSessions"

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

  // Token-aware session creator. Passing this into TimerCard is what makes the
  // front-page timer persist a session AND award spin tokens.
  const { addSession } = useSessions()

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
        <span style={{ marginRight: "10px" }}>🇪🇸</span>Spanish Tracker
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#a5b4fc",
          fontSize: "14px",
          margin: "0 0 28px 0",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Optimize your daily learning flow
      </p>

      <CategorySelector selectedCategory={category} setSelectedCategory={setCategory} />
      <TimerCard category={category} onSaveSession={addSession} />
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