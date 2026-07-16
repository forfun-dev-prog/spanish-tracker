import { getDailySeries } from "../utils/sessionStats"

const WEEKS = 12
const DAY_SIZE = 12
const DAY_GAP = 3

function colorForMinutes(minutes) {
  if (minutes <= 0) return "#ebedf0"
  if (minutes < 15) return "#c6e48b"
  if (minutes < 30) return "#7bc96f"
  if (minutes < 60) return "#239a3b"
  return "#196127"
}

function HabitGrid({ sessions }) {
  const totalDays = WEEKS * 7
  const series = getDailySeries(sessions, totalDays)

  // Pad the front of the series so the grid always starts on a Sunday,
  // keeping the weekday rows aligned like a real calendar.
  const firstDate = new Date(series[0].date)
  const leadingBlanks = firstDate.getDay()

  const initialCells = [...Array(leadingBlanks).fill(null), ...series]

  // Pad the trailing end of cells so the final week always has 7 spots.
  // This keeps column flexboxes looking perfectly aligned.
  const totalCellsNeeded = Math.ceil(initialCells.length / 7) * 7
  const cells = [
    ...initialCells,
    ...Array(totalCellsNeeded - initialCells.length).fill(null)
  ]

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div>
      <h2>Habit Grid</h2>

      <div style={{ display: "flex", gap: DAY_GAP }}>
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            style={{ display: "flex", flexDirection: "column", gap: DAY_GAP }}
          >
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                title={day ? `${day.date}: ${day.minutes} min` : ""}
                style={{
                  width: DAY_SIZE,
                  height: DAY_SIZE,
                  borderRadius: 2,
                  backgroundColor: day ? colorForMinutes(day.minutes) : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <p>
        <small>Less</small>{" "}
        {[0, 10, 20, 45, 90].map((m) => (
          <span
            key={m}
            style={{
              display: "inline-block",
              width: DAY_SIZE,
              height: DAY_SIZE,
              borderRadius: 2,
              backgroundColor: colorForMinutes(m),
              marginRight: 2,
              verticalAlign: "middle",
            }}
          />
        ))}{" "}
        <small>More</small>
      </p>
    </div>
  )
}

export default HabitGrid