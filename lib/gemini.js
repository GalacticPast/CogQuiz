import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateQuizFromPDF(pdfPart) {
  // Initialize Gemini inside function to avoid module-level errors
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

  // Apply the magic JSON bullet right here when getting the model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `Generate 10 quiz questions from this PDF.
Return JSON only, no explanation, no code fences.
Format:
{
  "category": "subject name inferred from the PDF",
  "questions": [
    {
      "question": "question text here",
      "options": {
        "A": "option text",
        "B": "option text", 
        "C": "option text",
        "D": "option text"
      },
      "correct": integer -> needs to be from 0 to 3, 0 is 'A', 1 is 'B', 2 is 'C' and 3 is 'D' 
      "explanation": "why the correct answer is right"
    }
  ]
}`;

  // Now you just pass the array to generateContent
  const result = await model.generateContent([prompt, pdfPart]);

  const raw = result.response.text();

  //  // 1. Log the exact string Gemini returned
  //  console.log("\n====== RAW GEMINI RESPONSE ======");
  //  console.log(raw);
  //  console.log("=================================\n");

  // Clean the text just in case it included markdown
  const cleanText = raw.replace(/```json|```/gi, "").trim();

  // Parse it into a real JavaScript object
  const parsedData = JSON.parse(cleanText);

  //  // 2. Log the parsed object to ensure it formatted correctly
  //  // Using console.dir with depth: null forces Node to show the whole nested object
  //  console.log("====== PARSED QUIZ DATA ======");
  //  console.dir(parsedData, { depth: null });
  //  console.log("==============================\n");
  //
  // Return the final data to your route
  return parsedData;
}
