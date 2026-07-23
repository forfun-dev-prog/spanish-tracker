import { useMemo, useState, useRef, useEffect } from "react";
import useSessions from "../hooks/useSessions";
import { computeStreaks } from "../utils/streaks";
import { ACTIVITY_COLORS } from "../constants/activities";

const CATEGORIES = Object.keys(ACTIVITY_COLORS);
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const ALL_TREND_COLOR = "#818cf8";

// Scales smoothly between the mobile-safe size we verified (10px cells,
// 3px gaps) and a roomier desktop size, based on viewport width — no JS
// measurement needed. At the max end (16px cells, 5px cell gap, 20px month
// gap), three months still comfortably fit within the 600px card.
const HABIT_CELL_SIZE = "clamp(10px, 2.2vw, 16px)";
const HABIT_CELL_GAP = "clamp(3px, 0.5vw, 5px)";
const HABIT_MONTH_GAP = "clamp(8px, 1.5vw, 20px)";

const SCOPES = [
  { id: "week", label: "Week" },
  { id: "30days", label: "30 Days" },
  { id: "6months", label: "6 Months" },
  { id: "all", label: "All Time" },
];

const CHART_TYPES = [
  { id: "bar", label: "Stacked" },
  { id: "line", label: "Line" },
];

const cardStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(15, 10, 30, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: 20,
  padding: 24,
  marginBottom: 28,
};

const cardTitleStyle = {
  textAlign: "center",
  margin: "0 0 20px 0",
  fontSize: 18,
  color: "#ffffff",
};

const fmtHours = (minutes) => (minutes / 60).toFixed(1);
const fmtShortDate = (dateOrKey) =>
  new Date(dateOrKey).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function weekStart(d) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

const makeBucket = (key, label) => ({
  key,
  label,
  breakdown: Object.fromEntries(CATEGORIES.map((c) => [c, 0])),
  total: 0,
});

function bucketKeyFor(date, granularity) {
  if (granularity === "day") return startOfDay(date).toDateString();
  if (granularity === "week") return weekStart(date).toDateString();
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function bucketLabel(date, granularity) {
  if (granularity === "month") return date.toLocaleDateString("en-US", { month: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 3, gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.3px",
              background: active ? "#6366f1" : "transparent",
              color: active ? "#ffffff" : "#a5b4fc",
              transition: ".15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", color: "#a5b4fc", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, margin: "2px 0", color: "#f8fafc" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#64748b" }}>{sub}</div>
    </div>
  );
}

function TrendLine({ buckets, getValue, maxValue, color }) {
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect?.width;
      if (measured && measured > 0) setWidth(measured);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const H = 180;
  const padX = 8;
  const padY = 16;
  const n = buckets.length;
  const innerW = Math.max(width - padX * 2, 1);
  const innerH = H - padY * 2;

  const pts = buckets.map((b, i) => {
    const val = getValue(b);
    const x = padX + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = padY + innerH - (maxValue ? (val / maxValue) * innerH : 0);
    return { x, y, b, val };
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area =
    n >= 2 ? `${line} L${pts[n - 1].x.toFixed(1)},${padY + innerH} L${pts[0].x.toFixed(1)},${padY + innerH} Z` : "";
  const colW = n ? innerW / n : innerW;

  return (
    <div ref={wrapperRef} style={{ width: "100%", boxSizing: "border-box" }}>
      <svg
        viewBox={`0 0 ${width} ${H}`}
        width={width}
        height={H}
        style={{ display: "block", maxWidth: "100%" }}
      >
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * (1 - t)}
            y2={padY + innerH * (1 - t)}
            stroke="rgba(255,255,255,0.06)"
          />
        ))}

        {area && <path d={area} fill="url(#trendFill)" />}
        {n >= 2 && (
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {pts.map((p, i) => (
          <rect key={i} x={padX + i * colW} y={0} width={colW} height={H} fill="transparent">
            <title>{`${p.b.label}: ${fmtHours(p.val)}h`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}

function Stats() {
  const { sessions } = useSessions();
  const [scope, setScope] = useState("30days");
  const [chartType, setChartType] = useState("bar");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [trendCategory, setTrendCategory] = useState("all");

  const sessionsDateSet = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => set.add(new Date(s.date).toDateString()));
    return set;
  }, [sessions]);

  const { currentStreak, longestStreak } = useMemo(() => computeStreaks(sessions), [sessions]);

  const analytics = useMemo(() => {
    const now = new Date();

    let startDate;
    if (scope === "week") {
      startDate = startOfDay(now);
      startDate.setDate(startDate.getDate() - 6);
    } else if (scope === "30days") {
      startDate = startOfDay(now);
      startDate.setDate(startDate.getDate() - 29);
    } else if (scope === "6months") {
      startDate = startOfDay(now);
      startDate.setMonth(startDate.getMonth() - 6);
      startDate.setDate(startDate.getDate() + 1);
    } else {
      let earliest = now;
      sessions.forEach((s) => {
        const d = new Date(s.date);
        if (d < earliest) earliest = d;
      });
      startDate = startOfDay(earliest);
    }

    const granularity =
      scope === "week" || scope === "30days" ? "day" : scope === "6months" ? "week" : "month";

    const buckets = [];
    if (granularity === "day") {
      const cur = new Date(startDate);
      while (cur <= now) {
        buckets.push(makeBucket(cur.toDateString(), bucketLabel(cur, "day")));
        cur.setDate(cur.getDate() + 1);
      }
    } else if (granularity === "week") {
      const cur = weekStart(startDate);
      while (cur <= now) {
        buckets.push(makeBucket(cur.toDateString(), bucketLabel(cur, "week")));
        cur.setDate(cur.getDate() + 7);
      }
    } else {
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      while (cur <= end) {
        buckets.push(makeBucket(`${cur.getFullYear()}-${cur.getMonth()}`, bucketLabel(cur, "month")));
        cur.setMonth(cur.getMonth() + 1);
      }
    }
    const bucketMap = new Map(buckets.map((b) => [b.key, b]));

    const categoryMinutes = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    const subcategoryMinutes = {};
    const dailyMinutes = new Map();
    let totalMinutes = 0;

    sessions.forEach((s) => {
      const d = new Date(s.date);
      if (d < startDate || d > now) return;
      if (!Object.prototype.hasOwnProperty.call(categoryMinutes, s.category)) return;

      const minutes = s.duration / 60;
      categoryMinutes[s.category] += minutes;
      totalMinutes += minutes;

      const subLabel = (s.subcategory && s.subcategory.trim()) || "Unspecified";
      if (!subcategoryMinutes[s.category]) subcategoryMinutes[s.category] = {};
      subcategoryMinutes[s.category][subLabel] = (subcategoryMinutes[s.category][subLabel] || 0) + minutes;

      const dayKey = startOfDay(d).toDateString();
      dailyMinutes.set(dayKey, (dailyMinutes.get(dayKey) || 0) + minutes);

      const bucket = bucketMap.get(bucketKeyFor(d, granularity));
      if (bucket) {
        bucket.breakdown[s.category] += minutes;
        bucket.total += minutes;
      }
    });

    let minDay = null;
    let maxDay = null;
    dailyMinutes.forEach((mins, key) => {
      if (!maxDay || mins > maxDay.minutes) maxDay = { minutes: mins, key };
      if (!minDay || mins < minDay.minutes) minDay = { minutes: mins, key };
    });
    const activeDays = dailyMinutes.size;
    const avgMinutes = activeDays ? totalMinutes / activeDays : 0;

    const categoryBreakdown = CATEGORIES.map((cat) => ({
      category: cat,
      minutes: categoryMinutes[cat],
      pct: totalMinutes ? (categoryMinutes[cat] / totalMinutes) * 100 : 0,
    }))
      .filter((c) => c.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);

    const maxBucketTotal = Math.max(...buckets.map((b) => b.total), 1);

    return {
      granularity,
      buckets,
      maxBucketTotal,
      categoryMinutes,
      subcategoryMinutes,
      categoryBreakdown,
      totalMinutes,
      avgMinutes,
      minDay,
      maxDay,
      activeDays,
    };
  }, [sessions, scope]);

  const monthBlocks = useMemo(() => {
    const today = new Date();
    const blocks = [];

    for (let offset = 2; offset >= 0; offset--) {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      const year = firstOfMonth.getFullYear();
      const month = firstOfMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const leadingBlanks = firstOfMonth.getDay();

      const cells = [];
      for (let i = 0; i < leadingBlanks; i++) cells.push(null);
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = date.toDateString();
        cells.push({
          dateKey,
          label: dateKey,
          isActive: sessionsDateSet.has(dateKey),
          isFuture: date > today,
        });
      }

      blocks.push({
        key: `${year}-${month}`,
        label: firstOfMonth.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        cells,
      });
    }
    return blocks;
  }, [sessionsDateSet]);

  const radarSvgSize = 300;
  const center = radarSvgSize / 2;
  const radius = 100;

  const radarCoordinates = useMemo(() => {
    const cats = analytics.categoryMinutes;
    const maxRadarValue = Math.max(...Object.values(cats), 10);
    return CATEGORIES.map((cat, index) => {
      const angle = (Math.PI * 2 * index) / CATEGORIES.length - Math.PI / 2;
      const val = cats[cat] || 0;
      const vRadius = (val / maxRadarValue) * radius;
      return {
        category: cat,
        gridX: center + radius * Math.cos(angle),
        gridY: center + radius * Math.sin(angle),
        dataX: center + vRadius * Math.cos(angle),
        dataY: center + vRadius * Math.sin(angle),
        labelX: center + (radius + 28) * Math.cos(angle),
        labelY: center + (radius + 15) * Math.sin(angle),
      };
    });
  }, [analytics, center, radius]);

  const dataPolygonPath = radarCoordinates.map((p) => `${p.dataX},${p.dataY}`).join(" ");

  const { buckets, maxBucketTotal, categoryBreakdown, maxDay, minDay } = analytics;
  const granularityLabel =
    analytics.granularity === "day" ? "daily" : analytics.granularity === "week" ? "weekly" : "monthly";

  const categoriesInChart = CATEGORIES.filter((cat) => buckets.some((b) => b.breakdown[cat] > 0));

  const activeTrendCategory =
    trendCategory === "all" || categoriesInChart.includes(trendCategory) ? trendCategory : "all";

  const trendColor = activeTrendCategory === "all" ? ALL_TREND_COLOR : ACTIVITY_COLORS[activeTrendCategory];
  const trendGetValue = (b) => (activeTrendCategory === "all" ? b.total : b.breakdown[activeTrendCategory] || 0);
  const trendMaxValue = Math.max(...buckets.map(trendGetValue), 1);

  const getSubBreakdown = (category) => {
    const map = analytics.subcategoryMinutes[category] || {};
    const catTotal = analytics.categoryMinutes[category] || 0;
    return Object.entries(map)
      .map(([name, minutes]) => ({ name, minutes, pct: catTotal ? (minutes / catTotal) * 100 : 0 }))
      .sort((a, b) => b.minutes - a.minutes);
  };

  const trendPillStyle = (active, color) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 999,
    cursor: "pointer",
    background: active ? `${color}26` : "rgba(255,255,255,0.04)",
    border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.08)",
    color: active ? "#f8fafc" : "#94a3b8",
  });

  return (
    <div style={{ maxWidth: "600px", width: "100%", boxSizing: "border-box", margin: "40px auto", padding: "32px 24px", background: "#0f0a1e", color: "#f8fafc", borderRadius: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)" }}>

      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", margin: "0" }}>📊 Stats Overview</h1>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <Segmented options={SCOPES} value={scope} onChange={setScope} />
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Summary</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          <StatCard label="Total" value={`${fmtHours(analytics.totalMinutes)}h`} sub={`${analytics.activeDays} active day${analytics.activeDays === 1 ? "" : "s"}`} />
          <StatCard label="Daily avg" value={analytics.activeDays ? `${fmtHours(analytics.avgMinutes)}h` : "—"} sub="per active day" />
          <StatCard label="Peak day" value={maxDay ? `${fmtHours(maxDay.minutes)}h` : "—"} sub={maxDay ? fmtShortDate(maxDay.key) : "—"} />
          <StatCard label="Quietest day" value={minDay ? `${fmtHours(minDay.minutes)}h` : "—"} sub={minDay ? fmtShortDate(minDay.key) : "—"} />
          <StatCard label="Current streak" value={`${currentStreak}d`} sub={currentStreak > 0 ? "keep it going!" : "start today!"} />
          <StatCard label="Longest streak" value={`${longestStreak}d`} sub="personal best" />
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Time by Category</h3>
        <p style={{ textAlign: "center", fontSize: 11, color: "#64748b", margin: "-12px 0 16px 0" }}>
          Tap a category to see its subcategory breakdown
        </p>
        {categoryBreakdown.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, margin: 0 }}>No sessions in this period.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {categoryBreakdown.map((c) => {
              const isOpen = expandedCategory === c.category;
              const subBreakdown = isOpen ? getSubBreakdown(c.category) : [];
              return (
                <div key={c.category}>
                  <button
                    type="button"
                    onClick={() => setExpandedCategory(isOpen ? null : c.category)}
                    style={{
                      display: "block",
                      width: "100%",
                      background: "none",
                      border: "none",
                      padding: "6px 0",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>
                        <span style={{ width: 11, height: 11, borderRadius: 3, background: ACTIVITY_COLORS[c.category], display: "inline-block", flexShrink: 0 }} />
                        {c.category}
                        <span style={{ fontSize: 10, color: "#64748b" }}>{isOpen ? "▲" : "▾"}</span>
                      </span>
                      <span style={{ fontSize: 13, color: "#cbd5e1" }}>{fmtHours(c.minutes)}h · {c.pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.pct}%`, background: ACTIVITY_COLORS[c.category], borderRadius: 3 }} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ paddingLeft: 19, paddingTop: 8, paddingBottom: 4, display: "flex", flexDirection: "column", gap: 8 }}>
                      {subBreakdown.length === 0 ? (
                        <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                          No subcategories logged yet for {c.category}.
                        </p>
                      ) : (
                        subBreakdown.map((sub) => (
                          <div key={sub.name}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#cbd5e1", marginBottom: 3 }}>
                              <span>{sub.name}</span>
                              <span>{fmtHours(sub.minutes)}h · {sub.pct.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${sub.pct}%`, background: ACTIVITY_COLORS[c.category], opacity: 0.6, borderRadius: 2 }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Skill Profile</h3>
        <svg width={radarSvgSize} height={radarSvgSize} style={{ overflow: "visible", display: "block", margin: "0 auto" }}>
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <polygon key={i} points={radarCoordinates.map((p) => `${center + (p.gridX - center) * scale},${center + (p.gridY - center) * scale}`).join(" ")} fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
          ))}
          {radarCoordinates.map((p, i) => <line key={i} x1={center} y1={center} x2={p.gridX} y2={p.gridY} stroke="rgba(255,255,255,0.15)" />)}
          <polygon points={dataPolygonPath} fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" strokeWidth="2" />
          {radarCoordinates.map((p, i) => (
            <text key={i} x={p.labelX} y={p.labelY} fill="#94a3b8" fontSize="11px" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
              {p.category}
            </text>
          ))}
        </svg>
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Habit Activity (3 Months)</h3>
        <div style={{ display: "flex", gap: HABIT_MONTH_GAP, justifyContent: "center", flexWrap: "wrap" }}>
          {monthBlocks.map((block) => (
            <div key={block.key}>
              <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "#a5b4fc", letterSpacing: "1px", marginBottom: 8 }}>
                {block.label}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${HABIT_CELL_SIZE})`, gap: HABIT_CELL_GAP }}>
                {WEEKDAYS.map((wd, i) => (
                  <div key={`wd-${i}`} style={{ fontSize: 7, color: "#64748b", textAlign: "center", fontWeight: 700 }}>
                    {wd}
                  </div>
                ))}
                {block.cells.map((cell, i) =>
                  cell === null ? (
                    <div key={`blank-${i}`} />
                  ) : (
                    <div
                      key={cell.dateKey}
                      title={`${cell.label}: ${cell.isActive ? "Completed" : cell.isFuture ? "Upcoming" : "No sessions"}`}
                      style={{
                        width: HABIT_CELL_SIZE,
                        height: HABIT_CELL_SIZE,
                        boxSizing: "border-box",
                        borderRadius: 2,
                        background: cell.isActive
                          ? "#22c55e"
                          : cell.isFuture
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(255,255,255,0.05)",
                        border: cell.isFuture ? "1px dashed rgba(255,255,255,0.08)" : "none",
                        transition: ".2s",
                      }}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#ffffff" }}>
            Activity Trend <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>({granularityLabel})</span>
          </h3>
          <Segmented options={CHART_TYPES} value={chartType} onChange={setChartType} />
        </div>

        {chartType === "bar" && categoriesInChart.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginBottom: 14 }}>
            {categoriesInChart.map((cat) => (
              <span key={cat} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#cbd5e1", fontWeight: 600 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: ACTIVITY_COLORS[cat], display: "inline-block", flexShrink: 0 }} />
                {cat}
              </span>
            ))}
          </div>
        )}

        {chartType === "line" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <button type="button" onClick={() => setTrendCategory("all")} style={trendPillStyle(activeTrendCategory === "all", ALL_TREND_COLOR)}>
              All
            </button>
            {categoriesInChart.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTrendCategory(cat)}
                style={trendPillStyle(activeTrendCategory === cat, ACTIVITY_COLORS[cat])}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: ACTIVITY_COLORS[cat], display: "inline-block", flexShrink: 0 }} />
                {cat}
              </button>
            ))}
          </div>
        )}

        {chartType === "bar" ? (
          <div style={{ display: "flex", alignItems: "flex-end", height: 180, gap: buckets.length > 40 ? 2 : 5, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
            {buckets.map((b) => (
              <div
                key={b.key}
                title={`${b.label}: ${fmtHours(b.total)}h`}
                style={{
                  flex: 1,
                  height: `${b.total > 0 ? (b.total / maxBucketTotal) * 100 : 2}%`,
                  backgroundColor: b.total > 0 ? "transparent" : "rgba(255,255,255,0.05)",
                  display: "flex",
                  flexDirection: "column-reverse",
                  borderRadius: "3px 3px 0 0",
                }}
              >
                {b.total > 0 &&
                  CATEGORIES.map((cat) => {
                    const height = (b.breakdown[cat] / b.total) * 100;
                    return height > 0 ? <div key={cat} style={{ width: "100%", height: `${height}%`, backgroundColor: ACTIVITY_COLORS[cat] }} /> : null;
                  })}
              </div>
            ))}
          </div>
        ) : (
          <TrendLine buckets={buckets} getValue={trendGetValue} maxValue={trendMaxValue} color={trendColor} />
        )}

        {buckets.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#64748b", fontWeight: 600 }}>
            <span>{buckets[0].label}</span>
            {buckets.length > 2 && <span>{buckets[Math.floor(buckets.length / 2)].label}</span>}
            <span>{buckets[buckets.length - 1].label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;