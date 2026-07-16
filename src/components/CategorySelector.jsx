import categories from "../data/defaultCategories"

function CategorySelector({ selectedCategory, setSelectedCategory }) {

  return (
    <div>
      <h2>Activity</h2>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </button>
      ))}

      <p>
        Selected: {selectedCategory}
      </p>

    </div>
  )
}

export default CategorySelector