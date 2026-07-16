import useTimer from "../hooks/useTimer"
import { addSession } from "../services/database"


function TimerCard({ category }) {

  const {
    seconds,
    running,
    start,
    stop,
    reset
  } = useTimer()


  async function handleStop() {

    stop()

    if (seconds > 5) {

      const session = {
        date: new Date().toISOString(),
        category: category,
        duration: seconds
      }

      await addSession(session)

      console.log("Saved:", session)
    }
  }


  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60


  return (
    <div>

      <h2>Study Timer</h2>

      <h3>
        {minutes}:{remainingSeconds.toString().padStart(2,"0")}
      </h3>


      <button onClick={start}>
        Start
      </button>


      <button onClick={handleStop}>
        Stop & Save
      </button>


      <button onClick={reset}>
        Reset
      </button>


      <p>
        Activity: {category}
      </p>


      <p>
        Status: {running ? "Studying" : "Paused"}
      </p>

    </div>
  )
}

export default TimerCard