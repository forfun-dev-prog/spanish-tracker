import useTimer from "../hooks/useTimer"

function TimerCard() {

  const {
    seconds,
    running,
    start,
    stop,
    reset
  } = useTimer()


  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60


  return (
    <div>
      <h2>Study Timer</h2>

      <h3>
        {minutes}:{remainingSeconds.toString().padStart(2, "0")}
      </h3>

      <button onClick={start}>
        Start
      </button>

      <button onClick={stop}>
        Stop
      </button>

      <button onClick={reset}>
        Reset
      </button>

      <p>
        Status: {running ? "Studying" : "Paused"}
      </p>

    </div>
  )
}

export default TimerCard