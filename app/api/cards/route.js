import { getDueCards, getDueCardsByDeck, updateCard } from "@/services/db";

export async function GET(request) {
  try {
    // 1. Create the URL object to parse the incoming address
    const url = new URL(request.url);
    // 2. Extract 'deckId' from the query parameters (?deckId=...)
    const deckId = url.searchParams.get("deckId");

    let cards;

    // 3. Logic Switch: If we have an ID, filter by deck. If not, get all.
    if (deckId) {
      // Ensure your service function is imported and takes deckId as an argument
      cards = await getDueCardsByDeck(deckId);
    } else {
      cards = await getDueCards();
    }

    // 4. Return the data (using 'cards' to match your frontend expectation)
    return Response.json({ success: true, cards });
  } catch (e) {
    if (e.message === "Not authenticated") {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    return Response.json({ error: e.message }, { status: 500 });
  }
}
export async function PATCH(request) {
  try {
    const body = await request.json();
    const card = body.card;
    const userScore = body.userScore;
    await updateCard(card, userScore);
    return;
  } catch (e) {
    if (e.message === "Not authenticated") {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
