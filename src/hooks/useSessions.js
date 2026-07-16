// useSessions.js
import { useLiveQuery } from "dexie-react-hooks"
import db from "../services/database"

function useSessions() {
  // useLiveQuery automatically observes Dexie changes and forces a re-render
  const sessions = useLiveQuery(
    async () => {
      return await db.sessions.toArray()
    },
    [] // dependency array (similar to useEffect)
  )

  return {
    // If the database is still opening/querying, default to an empty array
    sessions: sessions || []
  }
}

export default useSessions