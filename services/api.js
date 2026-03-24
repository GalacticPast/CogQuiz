import { createClient } from "@/lib/supabase-browser";

// ================================
// AUTH
// ================================

export async function signInWithGoogle() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: "google",
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

// this function is having the internal server eorr - the error 500)
// we are already the server why tf are we doing this??
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

// this should be in the db.js file
// FIXME:
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

export async function scheduleReviewSession({
  deckId,
  totalQuestions,
  mistakes,
}) {
  const response = await fetch("/api/calendar/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deckId, totalQuestions, mistakes }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Scheduling failed");
  return result;
}
