// src/pages/Login.jsx
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.4C41.4 36.3 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  )
}

function Login() {
  const { signIn, signUp, signInWithGoogle, resetPasswordForEmail } = useAuth()
  const [mode, setMode] = useState("signIn") // "signIn" | "signUp" | "forgot"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
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

  const resetMessages = () => {
    setError("")
    setInfo("")
  }

  const switchMode = (next) => {
    setMode(next)
    resetMessages()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    resetMessages()
    setLoading(true)

    if (mode === "forgot") {
      const { error: resetError } = await resetPasswordForEmail(email)
      setLoading(false)
      if (resetError) {
        setError(resetError.message)
        return
      }
      // Deliberately doesn't confirm whether the address has an account —
      // that's Supabase's own behavior, and the UI shouldn't leak it either.
      setInfo("If an account exists for that email, a reset link is on its way. Check your inbox.")
      return
    }

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

  const handleGoogle = async () => {
    resetMessages()
    const { error: googleError } = await signInWithGoogle()
    // On success the browser navigates away to Google immediately, so
    // there's nothing further to do here — control returns to the app via
    // the redirect once the user completes sign-in on Google's side.
    if (googleError) setError(googleError.message)
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
        {mode === "signIn" ? "Sign in" : mode === "signUp" ? "Create an account" : "Reset your password"}
      </p>

      {mode !== "forgot" && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "11px 18px",
              fontSize: 14,
              fontWeight: 700,
              color: "#1f2937",
              background: "#ffffff",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: mode === "forgot" ? 20 : 16 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        {mode !== "forgot" && (
          <div style={{ marginBottom: 8 }}>
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
        )}

        {mode === "signIn" && (
          <button
            type="button"
            onClick={() => switchMode("forgot")}
            style={{
              display: "block",
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#818cf8",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
              marginBottom: 20,
            }}
          >
            Forgot password?
          </button>
        )}
        {mode !== "signIn" && <div style={{ marginBottom: 20 }} />}

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
          {loading ? "Please wait…" : mode === "signIn" ? "Sign In" : mode === "signUp" ? "Sign Up" : "Send Reset Link"}
        </button>
      </form>

      {mode === "forgot" ? (
        <button
          type="button"
          onClick={() => switchMode("signIn")}
          style={{ display: "block", width: "100%", background: "none", border: "none", color: "#818cf8", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center" }}
        >
          Back to sign in
        </button>
      ) : (
        <button
          type="button"
          onClick={() => switchMode(mode === "signIn" ? "signUp" : "signIn")}
          style={{ display: "block", width: "100%", background: "none", border: "none", color: "#818cf8", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center" }}
        >
          {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      )}
    </div>
  )
}

export default Login