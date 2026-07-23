// src/data/subcategories.js
// Default subcategory suggestions per top-level category — purely a seed
// for the chip picker. A person's own logging history always ranks above
// these once it exists; these just prevent an empty picker on day one.
export const DEFAULT_SUBCATEGORIES = {
  Listening: ["Music", "Podcast", "Radio", "Audiobook"],
  Watching: ["TV Series", "Movie", "YouTube", "Documentary"],
  Reading: ["Novel", "Graded Reader", "Non-fiction", "Comic", "News Article"],
  "Reading Aloud": ["Novel", "Graded Reader", "Textbook", "Poem or Song"],
  Speaking: ["AI Conversation", "Tutor", "Exchange Partner", "Self-talk"],
  Shadowing: ["Podcast", "TV or Film", "Audiobook"],
  Writing: ["Journaling", "Essay", "Messaging", "Translation"],
  Grammar: ["Textbook Drills", "App Exercises", "Grammar Guide"],
  Vocabulary: ["Flashcards / SRS", "Word Lists", "Vocabulary App"],
}

export default DEFAULT_SUBCATEGORIES