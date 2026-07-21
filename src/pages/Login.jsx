// src/pages/Login.jsx
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState("signIn") // "signIn" | "signUp"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setLoading(true)

    const { error: authError } =
      mode === "signIn" ? await signIn(email, password) : await signUp(email, password)

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === "signUp") {
      setInfo("Check your email to confirm your account, then sign in.")
    }
  }

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
      <h1 style={{ textAlign: "center", fontSize: 26, fontWeight: 900, margin: "0 0 4px 0" }}>Language Tracker</h1>
      <p style={{ textAlign: "center", color: "#a5b4fc", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, marginBottom: 28 }}>
        {mode === "signIn" ? "Sign in" : "Create an account"}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {info && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#a7f3d0", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {info}
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
            marginBottom: 14,
          }}
        >
          {loading ? "Please wait…" : mode === "signIn" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signIn" ? "signUp" : "signIn")
          setError("")
          setInfo("")
        }}
        style={{ display: "block", width: "100%", background: "none", border: "none", color: "#818cf8", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center" }}
      >
        {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  )
}

export default Login