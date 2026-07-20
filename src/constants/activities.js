// src/constants/activities.js
// Single source of truth for category colors/icons. Stats, History, and
// Achievements all import from here so they can't drift out of sync again
// (History previously kept its own incomplete copy of this map).
export const ACTIVITY_COLORS = {
  Listening: "#06b6d4",
  Watching: "#f97316",
  Reading: "#eab308",
  "Reading Aloud": "#3b82f6",
  Speaking: "#22c55e",
  Shadowing: "#10b981",
  Writing: "#f43f5e",
  Grammar: "#a855f7",
  Vocabulary: "#ec4899",
}

export const CATEGORY_ICONS = {
  Listening: "🎧",
  Watching: "📺",
  Reading: "📖",
  "Reading Aloud": "🗣️",
  Speaking: "💬",
  Shadowing: "👥",
  Writing: "✍️",
  Grammar: "🧬",
  Vocabulary: "🎴",
}