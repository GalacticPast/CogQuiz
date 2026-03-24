import { getDueCards, getDueCardsByDeck, submitReview } from "@/services/db";

export async function GET(request) {
  try {
    // 1. Read the URL parameters
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // returns "due"

    const cards = await getDueCards();

    return Response.json({ success: true, cards });
  } catch (e) {
    if (e.message === "Not authenticated") {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function updateCard(request) {
  try {
    const body = await request.json();
    const cardId = body.cardId;
    const userScore = body.userScore;
    await submitReview(cardId, userScore);
    return;
  } catch (e) {
    if (e.message === "Not authenticated") {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
