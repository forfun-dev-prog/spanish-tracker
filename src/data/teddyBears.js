// src/data/teddyBears.js
// Collectible teddy bears. Prices climb from 10,000 to 1,000,000.
// `id` is the stable key stored in the owned-bears list, so don't rename ids
// once players may have bought them.
export const TEDDY_BEARS = [
  { id: "miel",       name: "Honey Bear",        price: 10000,   emoji: "🧸", color: "#fbbf24", rarity: "Common" },
  { id: "canela",     name: "Cinnamon Bear",     price: 20000,   emoji: "🧸", color: "#d97706", rarity: "Common" },
  { id: "fresa",      name: "Berry Bear",        price: 35000,   emoji: "🧸", color: "#fb7185", rarity: "Uncommon" },
  { id: "menta",      name: "Minty Bear",        price: 50000,   emoji: "🧸", color: "#34d399", rarity: "Uncommon" },
  { id: "cielo",      name: "Sky Bear",          price: 75000,   emoji: "🧸", color: "#38bdf8", rarity: "Rare" },
  { id: "lavanda",    name: "Lavender Bear",     price: 100000,  emoji: "🧸", color: "#a78bfa", rarity: "Rare" },
  { id: "rosa",       name: "Rose Bear",         price: 150000,  emoji: "🧸", color: "#f472b6", rarity: "Epic" },
  { id: "solar",      name: "Solar Bear",        price: 250000,  emoji: "🧸", color: "#f59e0b", rarity: "Epic" },
  { id: "medianoche", name: "Midnight Bear",     price: 400000,  emoji: "🧸", color: "#6366f1", rarity: "Legendary" },
  { id: "esmeralda",  name: "Emerald Bear",      price: 600000,  emoji: "🧸", color: "#10b981", rarity: "Legendary" },
  { id: "rubi",       name: "Ruby Bear",         price: 800000,  emoji: "🧸", color: "#ef4444", rarity: "Mythic" },
  { id: "dorado",     name: "Golden Royal Bear", price: 1000000, emoji: "🧸", color: "#eab308", rarity: "Mythic" },
]

export default TEDDY_BEARS