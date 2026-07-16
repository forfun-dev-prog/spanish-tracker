import { useState, useEffect } from "react"

function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let interval

    if (running) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [running])

  function start() {
    setRunning(true)
  }

  function stop() {
    setRunning(false)
  }

  function reset() {
    setSeconds(0)
    setRunning(false)
  }

  return {
    seconds,
    running,
    start,
    stop,
    reset,
  }
}

export default useTimer