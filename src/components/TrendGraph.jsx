import { getDailySeries } from "../utils/sessionStats"

const DAYS = 30
const WIDTH = 600
const HEIGHT = 160
const PADDING = 24


// A dependency-free SVG bar chart of daily minutes studied over the
// last DAYS days. No charting library needed for something this simple.
function TrendGraph({ sessions }) {
  const series = getDailySeries(sessions, DAYS)
  const max = Math.max(...series.map((d) => d.minutes), 1)

  const chartWidth = WIDTH - PADDING * 2
  const chartHeight = HEIGHT - PADDING * 2
  const barGap = 2
  const barWidth = chartWidth / series.length - barGap

  return (
    <div>
      <h2>Trend (last {DAYS} days)</h2>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT}>
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="#ccc"
        />

        {series.map((day, i) => {
          const barHeight = (day.minutes / max) * chartHeight
          const x = PADDING + i * (barWidth + barGap)
          const y = HEIGHT - PADDING - barHeight

          return (
            <rect
              key={day.date}
              x={x}
              y={y}
              width={Math.max(barWidth, 1)}
              height={barHeight}
              fill="#4f83cc"
            >
              <title>{`${day.date}: ${day.minutes} min`}</title>
            </rect>
          )
        })}
      </svg>

      <p>
        <small>Peak day in this window: {max} min</small>
      </p>
    </div>
  )
}

export default TrendGraph