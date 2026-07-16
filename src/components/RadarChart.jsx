import { useMemo } from "react"
import categories from "../data/defaultCategories"

const SIZE = 300
const CENTER = SIZE / 2
const MAX_RADIUS = 100

function RadarChart({ sessions }) {
  // 1. Calculate totals per category
  const categoryTotals = useMemo(() => {
    const totals = {}
    categories.forEach(cat => { totals[cat] = 0 })
    
    sessions.forEach(session => {
      if (totals[session.category] !== undefined) {
        // Convert duration to hours or minutes (using minutes here)
        totals[session.category] += session.duration / 60
      }
    })
    return totals
  }, [sessions])

  const maxVal = Math.max(...Object.values(categoryTotals), 1)
  const numAxes = categories.length

  // 2. Generate coordinates for the background grid and data polygon
  const { gridPoints, dataPolygonPoints, labelPoints } = useMemo(() => {
    const levels = [0.25, 0.5, 0.75, 1] // Grid concentric rings
    
    const gridPoints = levels.map(level => {
      const radius = MAX_RADIUS * level
      return categories.map((_, i) => {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2
        return {
          x: CENTER + radius * Math.cos(angle),
          y: CENTER + radius * Math.sin(angle)
        }
      })
    })

    const dataPolygonPoints = categories.map((cat, i) => {
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2
      const valueRatio = categoryTotals[cat] / maxVal
      const radius = MAX_RADIUS * valueRatio
      return {
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle)
      }
    })

    const labelPoints = categories.map((cat, i) => {
      const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2
      // Draw labels slightly further out than the maximum grid line
      const radius = MAX_RADIUS + 24 
      return {
        text: cat,
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle)
      }
    })

    return { gridPoints, dataPolygonPoints, labelPoints }
  }, [categoryTotals, maxVal, numAxes])

  // Map coordinate arrays to SVG "points" strings
  const getPointsString = (points) => points.map(p => `${p.x},${p.y}`).join(" ")

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Skill Profile (Strengths & Weaknesses)</h2>
      <svg width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
        {/* Concentric helper grids */}
        {gridPoints.map((ring, idx) => (
          <polygon
            key={idx}
            points={getPointsString(ring)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Axis Spoke Lines */}
        {gridPoints[3].map((outerPoint, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={outerPoint.x}
            y2={outerPoint.y}
            stroke="#cbd5e1"
            strokeDasharray="2"
          />
        ))}

        {/* Solid Filled Study Data Area */}
        {sessions.length > 0 && (
          <polygon
            points={getPointsString(dataPolygonPoints)}
            fill="rgba(79, 131, 204, 0.4)"
            stroke="#4f83cc"
            strokeWidth="2"
          />
        )}

        {/* Axis Labels */}
        {labelPoints.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#475569"
          >
            {label.text}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default RadarChart