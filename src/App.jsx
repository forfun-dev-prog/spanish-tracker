import { useState } from "react"
import TimerCard from "./components/TimerCard"
import CategorySelector from "./components/CategorySelector"


function App() {

  const [category, setCategory] = useState("Listening")


  return (
    <div>

      <h1>🇪🇸 Spanish Tracker</h1>

      <CategorySelector
        selectedCategory={category}
        setSelectedCategory={setCategory}
      />

      <TimerCard />

    </div>
  )
}

export default App