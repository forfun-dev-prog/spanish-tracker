import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { useState } from "react"

import TimerCard from "./components/TimerCard"
import CategorySelector from "./components/CategorySelector"
import History from "./pages/History"


function Dashboard() {

  const [category, setCategory] = useState("Listening")


  return (
    <div>

      <h1>🇪🇸 Spanish Tracker</h1>


      <CategorySelector
        selectedCategory={category}
        setSelectedCategory={setCategory}
      />


      <TimerCard category={category} />

    </div>
  )
}



function App() {

  return (

    <BrowserRouter>

      <nav>

        <Link to="/">
          Home
        </Link>

        {" | "}

        <Link to="/history">
          History
        </Link>

      </nav>


      <Routes>

        <Route 
          path="/" 
          element={<Dashboard />}
        />

        <Route 
          path="/history" 
          element={<History />}
        />

      </Routes>


    </BrowserRouter>

  )
}


export default App