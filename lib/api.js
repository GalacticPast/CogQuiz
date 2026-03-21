
import { createClient } from "@/lib/supabase-browser";


// ================================
// AUTH
// ================================

export async function signInWithGoogle() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signInWithEmail(email, password) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signUpWithEmail(email, password) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/login";
}

export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// ================================
// DASHBOARD
// ================================

export async function getDashboardData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
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
  const supabase = createClient();
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
    category_id: deckMap[card.deck_id]?.category_id
  }));
}

// ================================
// UPLOAD
// ================================

export async function processUploadedPdf(file) {

  if (!file || file.type !== "application/pdf") {
    throw new Error("Please upload a PDF file only.");
  }

  // We have to use FormData to send files via fetch
  const formData = new FormData();
  formData.append("file", file);

  try {
    // Call our own secure Next.js route
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData, // Do NOT set 'Content-Type' headers when sending FormData
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw the error message sent from our server
      throw new Error(data.error || "Something went wrong on the server.");
    }

    // Return the deck_id so the UI knows where to redirect
    return data.deck_id;
  } catch (err) {
    throw new Error(err.message || "Network error occurred.");
  }

}

// ================================
// QUIZ
// ================================

export async function submitCardReview(cardId, rating) {
  const response = await fetch("/api/cards/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ card_id: cardId, rating }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Review failed");
  return result;
}
