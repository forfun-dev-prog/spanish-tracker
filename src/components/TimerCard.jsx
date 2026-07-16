import { useState } from "react"
import useTimer from "../hooks/useTimer"
import { addSession } from "../services/database"

function TimerCard({ category }) {
  const { seconds, running, start, stop, reset } = useTimer()
  const [isSaving, setIsSaving] = useState(false)

  async function handleStop() {
    stop()

    if (seconds > 5) {
      setIsSaving(true)
      try {
        const session = {
          date: new Date().toISOString(),
          category: category,
          duration: seconds
        }

        await addSession(session)
        console.log("Saved:", session)
        reset()
      } catch (error) {
        console.error("Failed to save session:", error)
      } finally {
        setIsSaving(false)
      }
    } else {
      alert("Session too short to save! Must be longer than 5 seconds.")
      reset()
    }
  }

  const minutesStr = Math.floor(seconds / 60).toString().padStart(2, "0")
  const secondsStr = (seconds % 60).toString().padStart(2, "0")

  return (
    <div>
      <h2>Study Timer</h2>

      <h3>
        {minutesStr}:{secondsStr}
      </h3>

      <button onClick={start} disabled={running || isSaving}>
        Start
      </button>

      <button onClick={handleStop} disabled={!running || isSaving}>
        {isSaving ? "Saving..." : "Stop & Save"}
      </button>

      <button onClick={reset} disabled={isSaving}>
        Reset
      </button>

      <p>Activity: {category}</p>
      <p>Status: {isSaving ? "Saving..." : running ? "Studying" : "Paused"}</p>
    </div>
  )
}

export default TimerCard