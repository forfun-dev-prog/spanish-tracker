import { useEffect, useState } from "react"
import { getSessions } from "../services/database"


function useSessions() {

  const [sessions, setSessions] = useState([])


  async function loadSessions() {
    const data = await getSessions()
    setSessions(data)
  }


  useEffect(() => {
    loadSessions()
  }, [])


  return {
    sessions,
    refreshSessions: loadSessions
  }
}


export default useSessions