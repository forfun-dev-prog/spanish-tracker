// src/components/Modal.jsx
import { useEffect } from "react"

function Modal({ children, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "radial-gradient(circle, #1a103c 0%, #090514 100%)",
          color: "#f8fafc",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal