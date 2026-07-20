// src/services/database.js
import Dexie from "dexie"

const db = new Dexie("SpanishTracker")

// Version 2 adds the 'metadata' store to remember tokens and wallet amounts
db.version(2).stores({
  sessions: "++id,date,category,duration",
  metadata: "key,value",
})

// --- Gamification Metadata Helpers ---
export async function getBalance(key) {
  try {
    const row = await db.metadata.get(key)
    return row ? row.value : 0
  } catch (e) {
    console.error("Error reading balance:", e)
    return 0
  }
}

export async function updateBalance(key, amount) {
  try {
    await db.metadata.put({ key, value: amount })
  } catch (e) {
    console.error("Error updating balance:", e)
  }
}

// --- Dynamic Token Reward Calculator ---
// Returns { tokensEarned, message } so the UI can celebrate with the exact count.
async function rewardTokensForSession(durationInSeconds) {
  try {
    const minutesStudied = durationInSeconds / 60
    let tokensEarned = Math.floor(minutesStudied / 10)
    let message = ""

    if (tokensEarned === 0 && Math.random() < 0.15) {
      tokensEarned = 1
      message = "🎲 Lucky Break! A surprise Spin Token!"
    } else if (tokensEarned > 0) {
      message = "Great focus — keep the streak going!"
    } else {
      message = "Session logged! Study longer next time to guarantee a spin token."
    }

    if (tokensEarned > 0) {
      const currentTokens = await getBalance("tokens")
      await updateBalance("tokens", currentTokens + tokensEarned)
    }

    return { tokensEarned, message }
  } catch (err) {
    console.error("Error computing token rewards:", err)
    return { tokensEarned: 0, message: "Session logged successfully!" }
  }
}

// --- CORE CRUD Operations ---
export async function addSession(session) {
  await db.sessions.add(session)
  return await rewardTokensForSession(session.duration)
}

export async function getSessions() {
  return await db.sessions.toArray()
}

export async function updateSession(id, changes) {
  await db.sessions.update(id, changes)
}

export async function deleteSession(id) {
  await db.sessions.delete(id)
}

// --- Teddy Bear Shop ---
export async function getOwnedBears() {
  const row = await db.metadata.get("ownedBears")
  return row?.value || []
}

// Atomic purchase: re-checks balance + ownership inside a transaction so two
// quick clicks can't double-spend or double-grant.
// Returns { ok, reason?, coins? }.
export async function buyBear(bearId, price) {
  try {
    return await db.transaction("rw", db.metadata, async () => {
      const coinsRow = await db.metadata.get("coins")
      const coins = coinsRow?.value || 0

      const ownedRow = await db.metadata.get("ownedBears")
      const owned = ownedRow?.value || []

      if (owned.includes(bearId)) return { ok: false, reason: "owned" }
      if (coins < price) return { ok: false, reason: "insufficient", coins }

      await db.metadata.put({ key: "coins", value: coins - price })
      await db.metadata.put({ key: "ownedBears", value: [...owned, bearId] })

      return { ok: true, coins: coins - price }
    })
  } catch (e) {
    console.error("buyBear failed:", e)
    return { ok: false, reason: "error" }
  }
}

// --- Detail Suggestion Exclusions ---
// "Hides" a specific details value from future suggestion chips/autocomplete
// for a category (e.g. to fix a typo that keeps reappearing). This never
// touches past session records — only what gets suggested going forward —
// so History and any stats derived from existing sessions are unaffected.
export async function getSuggestionExclusions(category) {
  try {
    const row = await db.metadata.get("suggestionExclusions")
    const map = row?.value || {}
    return map[category] || []
  } catch (e) {
    console.error("Error reading suggestion exclusions:", e)
    return []
  }
}

export async function excludeSuggestion(category, detailText) {
  try {
    const row = await db.metadata.get("suggestionExclusions")
    const map = row?.value || {}
    const normalized = detailText.trim().toLowerCase()
    const set = new Set(map[category] || [])
    set.add(normalized)
    map[category] = Array.from(set)
    await db.metadata.put({ key: "suggestionExclusions", value: map })
  } catch (e) {
    console.error("Error excluding suggestion:", e)
  }
}

// --- DEV TOOL: Clear All Data ---
// Wipes every session and every metadata entry (tokens, coins, owned bears,
// suggestion exclusions — everything). No undo. Intended for pre-launch
// testing only; remove the UI button for this once the app is actually
// being used to track real study hours.
export async function clearAllData() {
  try {
    await db.transaction("rw", db.sessions, db.metadata, async () => {
      await db.sessions.clear()
      await db.metadata.clear()
    })
  } catch (e) {
    console.error("clearAllData failed:", e)
  }
}

export default db