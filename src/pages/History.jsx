import useSessions from "../hooks/useSessions"


function History() {

  const { sessions } = useSessions()


  return (
    <div>

      <h1>📚 Study History</h1>


      {sessions.length === 0 && (
        <p>No sessions yet</p>
      )}


      {sessions.map((session) => (

        <div key={session.id}>

          <h3>
            {session.category}
          </h3>

          <p>
            {session.duration} seconds
          </p>

          <p>
            {new Date(session.date).toLocaleString()}
          </p>

          <hr />

        </div>

      ))}


    </div>
  )
}


export default History