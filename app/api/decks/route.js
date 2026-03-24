import { getDueDecksByCategory } from "@/services/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { categoryId } = body;

    const decks = await getDueDecksByCategory(categoryId);

    return Response.json({ success: true, decks });
  } catch (e) {
    if (e.message === "Not authenticated") {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    return Response.json({ error: e.message }, { status: 500 });
  }
}
