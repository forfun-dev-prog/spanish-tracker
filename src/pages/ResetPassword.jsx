// src/pages/ResetPassword.jsx
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

function ResetPassword() {
  const { updatePassword, clearPasswordRecovery } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    fontSize: 15,
    color: "#f8fafc",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    outline: "none",
  }

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 800,
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 6,
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    const { error: updateError } = await updatePassword(password)
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }
    setSuccess(true)
  }

  return (
    <div
      style={{
        maxWidth: 380,
        margin: "80px auto",
        padding: 32,
        background: "radial-gradient(circle,#1a103c 0%,#090514 100%)",
        color: "#f8fafc",
        borderRadius: 28,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: 24, fontWeight: 900, margin: "0 0 4px 0" }}>Set a new password</h1>
      <p style={{ textAlign: "center", color: "#a5b4fc", fontSize: 13, marginBottom: 28 }}>
        Choose a new password for your account.
      </p>

      {success ? (
        <>
          <div
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#a7f3d0",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            Password updated. You're all set.
          </div>
          <button
            onClick={clearPasswordRecovery}
            style={{
              width: "100%",
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#0f172a",
              background: "#fbbf24",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#0f172a",
              background: "#fbbf24",
              border: "none",
              borderRadius: 12,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      )}
    </div>
  )
}

export default ResetPassword