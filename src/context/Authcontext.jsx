// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../services/supabaseClient"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still checking for an existing session; null = signed out
  const [session, setSession] = useState(undefined)
  // True while the user is mid-way through a "forgot password" email link —
  // Supabase actually signs them into a temporary recovery session at that
  // point, so without this flag Gate would just drop them into the normal
  // app instead of showing the "set a new password" screen.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true)
      }
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user || null,
    isLoading: session === undefined,
    isPasswordRecovery,
    clearPasswordRecovery: () => setIsPasswordRecovery(false),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      }),
    // Sends the reset email. Supabase intentionally doesn't reveal whether
    // the address exists, so the UI should show the same message either way.
    resetPasswordForEmail: (email) =>
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      }),
    updatePassword: (newPassword) => supabase.auth.updateUser({ password: newPassword }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}