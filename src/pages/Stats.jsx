import useSessions from "../hooks/useSessions"
import HabitGrid from "../components/HabitGrid"
import TrendGraph from "../components/TrendGraph"


function Stats() {

  const { sessions } = useSessions()

  return (
    <div>

      <h1>📈 Stats</h1>

      <HabitGrid sessions={sessions} />

      <hr />

      <TrendGraph sessions={sessions} />

    </div>
  )
}


export default Stats