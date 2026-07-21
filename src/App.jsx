// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { useState } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { SessionsProvider } from "./context/SessionsContext"
import { LanguageProvider } from "./context/LanguageContext"

import TimerCard from "./components/TimerCard"
import CategorySelector from "./components/CategorySelector"
import SessionForm from "./components/SessionForm"
import Modal from "./components/Modal"
import LanguageSwitcher from "./components/LanguageSwitcher"
import Login from "./pages/Login"
import History from "./pages/History"
import Stats from "./pages/Stats"
import Plan from "./pages/Plan"
import useSessions from "./hooks/useSessions"
import useLanguage from "./hooks/useLanguage"

function PremiumNavBar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const getLinkStyle = (path) => {
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
      color: isActive ? "#ffffff" : "#94a3b8",
      background: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
      border: "1px solid transparent",
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
      <Link to="/plan" style={getLinkStyle("/plan")}>🗓️ Plan</Link>
      <Link to="/history" style={getLinkStyle("/history")}>History</Link>
      <Link to="/stats" style={getLinkStyle("/stats")}>Stats</Link>
      {user && (
        <button
          onClick={signOut}
          style={{
            fontSize: "14px",
            fontWeight: "800",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            padding: "8px 16px",
            borderRadius: "10px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f87171",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      )}
    </nav>
  )
}

function Dashboard() {
  const [category, setCategory] = useState("Listening")
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { currentLanguage } = useLanguage()
  const { addSession } = useSessions()

  const handleManualSave = async (data) => {
    await addSession(data)
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

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
        <LanguageSwitcher label="Studying" />
      </div>

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

// Everything here assumes a signed-in user — SessionsProvider/LanguageProvider
// both read `user` from AuthContext internally, so they must live inside it.
function AuthenticatedApp() {
  return (
    <SessionsProvider>
      <LanguageProvider>
        <BrowserRouter>
          <PremiumNavBar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/history" element={<History />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </SessionsProvider>
  )
}

function Gate() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc", background: "#090514" }}>
        Loading…
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#090514" }}>
        <Login />
      </div>
    )
  }

  return <AuthenticatedApp />
}

function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

export default App