// app/api/upload-pdf/route.js
import { NextResponse } from "next/server";
// Import your secure backend functions here instead of the frontend
import { generateQuizFromPDF } from "@/lib/gemini";
import {
  getOrCreateCategory,
  getOrCreateDeck,
  createFlashcard,
} from "@/services/db";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const quizData = await generateQuizFromPDF(buffer);

    if (quizData.status === 401) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const category_id = await getOrCreateCategory(quizData.category);
    const new_deck_id = await getOrCreateDeck(category_id, file.name);

    // Your loop is the correct way to handle sequential async inserts!
    for (const item of quizData.questions) {
      await createFlashcard({
        deckId: new_deck_id,
        question: item.question,
        optionsPayload: item.options,
        correct_awnser: item.correct,
        explanation: item.explanation,
      });
    }

    return NextResponse.json(
      { success: true, deck_id: new_deck_id },
      { status: 200 },
    );
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
