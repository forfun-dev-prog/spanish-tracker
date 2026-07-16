// src/pages/Shop.jsx
import { useLiveQuery } from "dexie-react-hooks"
import db, { buyBear } from "../services/database"
import { TEDDY_BEARS } from "../data/teddyBears"
import { useReward } from "../components/RewardCelebration"

const RARITY_COLOR = {
  Common: "#94a3b8",
  Uncommon: "#34d399",
  Rare: "#38bdf8",
  Epic: "#a78bfa",
  Legendary: "#fbbf24",
  Mythic: "#f472b6",
}

function Shop() {
  const celebrate = useReward()

  const coins = useLiveQuery(
    async () => {
      const row = await db.metadata.get("coins")
      return row?.value || 0
    },
    [],
    0
  )

  const owned = useLiveQuery(
    async () => {
      const row = await db.metadata.get("ownedBears")
      return row?.value || []
    },
    [],
    []
  )

  const ownedList = owned || []
  const balance = coins || 0
  const bears = [...TEDDY_BEARS].sort((a, b) => a.price - b.price)
  const ownedCount = ownedList.length
  const progressPct = (ownedCount / TEDDY_BEARS.length) * 100

  const handleBuy = async (bear) => {
    const result = await buyBear(bear.id, bear.price)
    if (result.ok) {
      celebrate({ title: `${bear.emoji} ${bear.name} adopted!`, subtitle: "Added to your collection" })
    }
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "20px auto",
        padding: 24,
        background: "radial-gradient(circle,#1a103c 0%,#090514 100%)",
        color: "#f8fafc",
        borderRadius: 28,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,.85), inset 0 0 40px rgba(139,92,246,.15)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>🧸 Teddy Shop</h2>
          <span style={{ fontSize: 13, color: "#a5b4fc" }}>
            Collected {ownedCount} / {TEDDY_BEARS.length}
          </span>
        </div>
        <div style={{ background: "rgba(255,255,255,.05)", padding: "10px 16px", borderRadius: 14, textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: ".5px" }}>Balance</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>🌟 {balance.toLocaleString()}</div>
        </div>
      </div>

      {/* Collection progress */}
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,.06)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#a855f7,#ec4899)", borderRadius: 4, transition: ".3s" }} />
      </div>

      {/* Bear grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
        {bears.map((bear) => {
          const isOwned = ownedList.includes(bear.id)
          const affordable = balance >= bear.price
          const rarityColor = RARITY_COLOR[bear.rarity] || RARITY_COLOR.Common

          return (
            <div
              key={bear.id}
              style={{
                background: isOwned ? `linear-gradient(160deg, ${bear.color}22, rgba(255,255,255,.03))` : "rgba(255,255,255,.03)",
                border: `1px solid ${isOwned ? bear.color + "66" : "rgba(255,255,255,.06)"}`,
                borderRadius: 18,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                boxShadow: isOwned ? `0 8px 20px -6px ${bear.color}55` : "none",
                opacity: isOwned || affordable ? 1 : 0.75,
              }}
            >
              {/* Colored halo so each same-emoji bear reads as distinct */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 10,
                  background: `radial-gradient(circle at 50% 35%, ${bear.color}44, ${bear.color}11)`,
                  border: `1px solid ${bear.color}55`,
                  filter: isOwned ? "none" : "grayscale(.55)",
                }}
              >
                <span style={{ fontSize: 40, lineHeight: 1 }}><div dangerouslySetInnerHTML={{ __html: bear.svg }} className="w-8 h-8" /></span>
              </div>

              <div style={{ fontSize: 11, fontWeight: 800, color: rarityColor, textTransform: "uppercase", letterSpacing: ".5px" }}>
                {bear.rarity}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, margin: "2px 0 10px", color: "#ffffff" }}>{bear.name}</div>

              {isOwned ? (
                <div style={{ marginTop: "auto", fontSize: 13, fontWeight: 800, color: bear.color, padding: "8px 0" }}>✓ Owned</div>
              ) : (
                <button
                  onClick={() => handleBuy(bear)}
                  disabled={!affordable}
                  title={affordable ? "" : "Not enough coins yet"}
                  style={{
                    marginTop: "auto",
                    width: "100%",
                    padding: "9px 8px",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: affordable ? "pointer" : "not-allowed",
                    background: affordable ? "#fbbf24" : "#334155",
                    color: affordable ? "#0f172a" : "#64748b",
                  }}
                >
                  🌟 {bear.price.toLocaleString()}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Shop