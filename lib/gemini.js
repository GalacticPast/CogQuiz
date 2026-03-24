import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateQuizFromPDF(pdfBuffer) {
  try {
    // Initialize Gemini only if key exists
    const apiKey = (process.env.GOOGLE_AI_API_KEY || "").trim();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBuffer.toString("base64"),
        },
      },
      //When the hackathon theme drops, only change the prompt text inside this function. Everything else stays the same.
      `You are an expert educator.

Your task is to analyze the provided PDF and determine the OPTIMAL number of quiz questions needed to fully cover the material.

CRITICAL REQUIREMENTS:
    The PDF may contain diagrams, charts, or scanned pages.
    You MUST:
    - Extract information from BOTH text and images
    - Interpret diagrams and figures when relevant
    - Do not ignore visual content

1. QUESTION COUNT RULES:
- Minimum: 10 questions
- Maximum: 50 questions
- Scale based on:
  - Length of the document
  - Number of distinct topics
  - Density of important details

2. COVER ALL MAJOR TOPICS:
   - Identify the main sections/topics in the PDF first.
   - Distribute questions across ALL sections (do not focus on just one area).
   - Ensure no section is left untested.

3. MAXIMIZE DETAIL:
   - Include both high-level concepts AND small but important details.
   - Include definitions, mechanisms, examples, edge cases, and exceptions.

4. AVOID REDUNDANCY:
   - No duplicate or reworded questions testing the same idea.

5. DIFFICULTY MIX:
   - 30% easy (basic recall)
   - 40% medium (understanding/application)
   - 30% hard (multi-step reasoning, tricky distinctions)

6. QUALITY OF DISTRACTORS:
   - Wrong answers must be plausible and related to the topic.
   - Avoid obviously incorrect options.

7. USE ONLY PDF CONTENT:
   - Do not invent facts not present in the PDF.

8. INTERNAL COVERAGE CHECK:
   - Before generating questions, internally map each question to a specific section of the PDF.

OUTPUT RULES:
- Return JSON only
- No explanation outside the JSON
- No code fences

FORMAT:
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
      "correct": "A",
      "explanation": "why the correct answer is right"
    }
  ]
}`,
    ]);

    const raw = result.response.text();
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}
