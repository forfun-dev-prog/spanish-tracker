// src/components/Modal.jsx
import { useEffect } from "react"

// Backdrop click intentionally does NOT close the modal anymore — a stray
// tap outside a form full of typed content (chips, notes, etc.) shouldn't
// silently discard it. Escape and the explicit × button are the only ways out.
function Modal({ children, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)

    // Lock the page behind the modal while it's open. Without this, a tall
    // form (lots of optional fields filled in) had nowhere to scroll *inside*
    // itself, so the browser scrolled the background page instead, leaving
    // the modal's own bottom content clipped and unreachable.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(3, 0, 12, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "radial-gradient(circle, #1a103c 0%, #090514 100%)",
          color: "#f8fafc",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.06)",
            color: "#94a3b8",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  )
}

export default Modal