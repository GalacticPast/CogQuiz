import { createClient } from "@/lib/supabase-server.js";

// ==========================================
// 1. DASHBOARD BOOTSTRAPPING
// ==========================================

export async function getInitialDashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("categories").select(`
      id,
      name,
      decks ( id, title )
    `);

  if (error) throw error;
  return data;
}

// ==========================================
// 2. FIND OR CREATE (Idempotent)
// ==========================================

export async function getOrCreateCategory(name) {
  console.log("Creating category " + name);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Ask ONLY for the "id" column to save bandwidth
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("name", name)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing.id;

  // 2. Ask ONLY for the "id" column of the newly inserted row
  const { data: created, error } = await supabase
    .from("categories")
    .insert([{ name, user_id: user.id }])
    .select("id")
    .single();

  if (error) throw error;

  return created.id;
}

export async function getOrCreateDeck(categoryId, title) {
  console.log("Creating Deck", title, "for category", categoryId);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Fetch ONLY the ID if the deck already exists
  const { data: existing } = await supabase
    .from("decks")
    .select("id")
    .eq("category_id", categoryId)
    .eq("title", title)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return existing.id;

  // 2. Return ONLY the ID of the newly created deck
  const { data: created, error } = await supabase
    .from("decks")
    .insert([{ category_id: categoryId, title, user_id: user.id }])
    .select("id")
    .single();

  if (error) throw error;

  return created.id;
}

// 1. ADD CURLY BRACES HERE to accept a single object
export async function createFlashcard({
  deckId,
  question,
  optionsPayload,
  correct_awnser, // (Note the spelling here so you match it in route.js!)
  explanation,
}) {
  console.log("Creating flashcard", question, "for deck", deckId);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const repetitions = 0; // num repetitions since the last correct awnser. (Rating > 3) This is wll be zero if the user rates the card < 3
  const ease_factor = 2.5; // The ease factor is used to determine the number of days to wait before reviewing again. Each call to SM-2 adjusts this number up or down based on quality.
  const prev_interval = 0; // This previous interval is used when calculating the new interval. previous interval should equal zero for the first review.

  const { data, error } = await supabase
    .from("cards")
    .insert([
      {
        deck_id: deckId,
        user_id: user.id,
        question,
        options: optionsPayload,
        answer: correct_awnser, // Maps to your database column
        explanation,
        repetitions,
        easiness_factor: ease_factor,
        interval_days: prev_interval,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getAllCategories() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

const { data: existing } = await supabase
  .from("categories")
  .select("*, decks(*)")   // * gets all fields, decks(*) gets decks inside each category
  .eq("user_id", user.id)

return existing

}

// ==========================================
// 3. SPACED REPETITION ENGINE
// ==========================================

export async function getDueCards(deckId) {
  console.log("I'm trying to get due cards", deckId);
  const supabase = await createClient();

  console.log("I'm trying to get due cards", deckId);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from("cards") // was 'flashcards'
    .select("*")
    .eq("deck_id", deckId)
    .lte("due_date", today) // was 'next_review' — matches your schema
    .order("due_date", { ascending: true });

  if (error) throw error;
  console.log("data", data);
  return data;
}

export function calculateSM2(card, quality) {
  let { repetitions, easiness_factor, interval_days } = card; // fixed field names
  const q = Math.max(0, Math.min(5, quality));

  if (q >= 3) {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.ceil(interval_days * easiness_factor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval_days = 1;
  }

  easiness_factor = Math.max(
    1.3,
    easiness_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + interval_days);
  const due_date = nextDue.toISOString().split("T")[0]; // store as date not timestamp

  return { repetitions, easiness_factor, interval_days, due_date };
}

export async function submitReview(card, userScore) {
  const supabase = await createClient();

  const newData = calculateSM2(card, userScore);

  const { error } = await supabase
    .from("cards") // was 'flashcards'
    .update({
      repetitions: newData.repetitions,
      easiness_factor: newData.easiness_factor, // fixed field name
      interval_days: newData.interval_days, // fixed field name
      due_date: newData.due_date, // fixed field name
    })
    .eq("id", card.id);

  if (error) throw error;
  return true;
}

export async function getCardsByDeckId(deckId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("deck_id", deckId)
    .eq("user_id", user.id)
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}
