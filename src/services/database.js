import Dexie from "dexie"


const db = new Dexie("SpanishTracker")


db.version(1).stores({
  sessions: "++id,date,category,duration"
})


export async function addSession(session) {
  await db.sessions.add(session)
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


export default db