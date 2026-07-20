import { useState, useEffect, useCallback } from "react"

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

  const start = useCallback(() => {
    setRunning(true)
  }, [])

  const stop = useCallback(() => {
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(0)
    setRunning(false)
  }, [])

  return {
    seconds,
    running,
    start,
    stop,
    reset,
  }
}

export default useTimer