// src/components/CategorySelector.jsx
import categories from "../data/defaultCategories"

function CategorySelector({ selectedCategory, setSelectedCategory }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Visual Header Label */}
      <span style={{ 
        display: "block", 
        fontSize: "12px", 
        color: "#a5b4fc", 
        textTransform: "uppercase", 
        letterSpacing: "1px", 
        marginBottom: "12px",
        textAlign: "center"
      }}>
        Select Study Activity
      </span>

      {/* Button Tray Container */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "8px", 
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.03)",
        padding: "12px",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                backgroundColor: isSelected ? "#6366f1" : "rgba(255, 255, 255, 0.06)",
                color: isSelected ? "#ffffff" : "#cbd5e1",
                boxShadow: isSelected ? "0 4px 12px rgba(99, 102, 241, 0.35)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CategorySelector