// app/api/upload-pdf/route.js
import { NextResponse } from "next/server";
// Import your secure backend functions here instead of the frontend
import { generateQuizFromPDF } from "@/lib/gemini";
import {
  getOrCreateCategory,
  getOrCreateDeck,
  createFlashcard,
} from "@/lib/db";

export async function POST(request) {
  try {
    // 1. Extract the file from the incoming request
    console.log("im here");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const pdfPart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };
    // specific gemini call
    const quizData = await generateQuizFromPDF(pdfPart);
    if (quizData.status === 401) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    // now we are going to generate the categories
    const category_id = await getOrCreateCategory(quizData.category);

    // this can change to our specifications
    const new_deck_id = await getOrCreateDeck(category_id, file.name);

    // Inside your route.js, after you create the newDeckId

    // okay so this might be slow, we can use other aproaches.
    // but if we make it an array of promises maybe when we return the database might
    // not be finished with the insertion yet. Oh well.
    // Use a standard 'for...of' loop for async operations
    for (const item of quizData.questions) {
      await createFlashcard({
        deckId: new_deck_id, // Make sure this is just the string!
        question: item.question,
        optionsPayload: item.options,
        correct_awnser: item.correct,
        explanation: item.explanation,
      });
    }
    // Once the loop finishes, ALL cards are safely in the database
    return NextResponse.json(
      { success: true, deck_id: new_deck_id },
      { status: 200 },
    );

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate quiz." },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: true, deck_id: 100001 },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
