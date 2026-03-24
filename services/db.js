"use server";
import { createClient } from "@/lib/supabase-server.js";

// ==========================================
// 1. DASHBOARD BOOTSTRAPPING
// ==========================================

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*") // * gets all fields
    .eq("user_id", user.id);

  if (categoriesError) throw new Error(categoriesError.message);

  const { data: decks, error: decksError } = await supabase
    .from("decks")
    .select("id, title, category_id")
    .eq("user_id", user.id);

  if (decksError) throw new Error(decksError.message);

  const decksByCategory = (decks || []).reduce((acc, deck) => {
    const key = deck.category_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ id: deck.id, title: deck.title });
    return acc;
  }, {});

  return (categories || []).map((category) => ({
    ...category,
    decks: decksByCategory[category.id] || [],
  }));
}
export async function getDueCards() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: cards, error: cardsError } = await supabase
    .from("cards")
    .select("id, question, due_date, deck_id")
    .eq("user_id", user.id)
    .lte("due_date", today)
    .order("due_date", { ascending: true });

  if (cardsError) throw new Error(cardsError.message);

  const deckIds = [
    ...new Set((cards || []).map((card) => card.deck_id).filter(Boolean)),
  ];
  let deckMap = {};

  if (deckIds.length > 0) {
    const { data: decks, error: decksError } = await supabase
      .from("decks")
      .select("id, title, category_id")
      .in("id", deckIds);

    if (decksError) throw new Error(decksError.message);

    deckMap = (decks || []).reduce((acc, deck) => {
      acc[deck.id] = { title: deck.title, category_id: deck.category_id };
      return acc;
    }, {});
  }

  return (cards || []).map((card) => ({
    ...card,
    deck: deckMap[card.deck_id]?.title || "Untitled Deck",
    category_id: deckMap[card.deck_id]?.category_id,
  }));
}

// ==========================================
// 2. FIND OR CREATE (Idempotent)
// ==========================================

export async function getOrCreateCategory(name) {
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

  const { data: existing, error: categoriesError } = await supabase
    .from("categories")
    .select("*") // * gets all fields
    .eq("user_id", user.id);

  if (categoriesError) throw new Error(categoriesError.message);

  return existing;
}

// ==========================================
// 3. SPACED REPETITION ENGINE
// ==========================================

export async function getDueDecksByCategory(categoryId) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Fetch the cards and tell Supabase to attach the related deck object
  const { data: cards_due_today, error } = await supabase
    .from("cards")
    .select(
      `
      deck_id,
      due_date,
      decks!inner (*) 
    `,
    )
    // Note: If cards doesn't have a category_id, we filter via the joined deck
    .eq("decks.category_id", categoryId)
    .lte("due_date", today);

  if (error) throw error;

  // 2. Quickly extract the unique full deck objects
  const uniqueDecks = Array.from(
    new Map(cards_due_today.map((card) => [card.deck_id, card.decks])).values(),
  );

  if (error) throw error;
  return uniqueDecks;
}

export async function getDueCardsByDeck(deckId) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from("cards") // was 'flashcards'
    .select("*")
    .eq("deck_id", deckId)
    .lte("due_date", today) // was 'next_review' — matches your schema
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}
export async function updateCard(card, userScore) {
  const supabase = await createClient();
  console.log("before: ", card);

  const q = Math.max(0, Math.min(5, userScore));

  // Fix: Use card. prefix for all properties
  if (q >= 3) {
    if (card.repetitions === 0) {
      card.interval_days = 1;
    } else if (card.repetitions === 1) {
      card.interval_days = 6;
    } else {
      // FIX: Added card. prefixes here
      card.interval_days = Math.ceil(card.interval_days * card.easiness_factor);
    }
    card.repetitions += 1;
  } else {
    card.repetitions = 0;
    card.interval_days = 1;
  }

  // Calculate new Easiness Factor
  card.easiness_factor = Math.max(
    1.3,
    card.easiness_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  // Calculate Next Due Date
  const nextDue = new Date();
  // FIX: Added card. prefix here
  nextDue.setDate(nextDue.getDate() + card.interval_days);
  card.due_date = nextDue.toISOString().split("T")[0];

  const { error } = await supabase
    .from("cards")
    .update({
      repetitions: card.repetitions,
      easiness_factor: card.easiness_factor,
      interval_days: card.interval_days,
      due_date: card.due_date,
    })
    .eq("id", card.id);

  if (error) {
    console.error("Supabase Error:", error);
    throw error;
  }
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

// THIS IS FOR THE CATEGORIES_DECK PAGE
//
