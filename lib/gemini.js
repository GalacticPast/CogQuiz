import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateQuizFromPDF(pdfBuffer) {
  try {
    // Initialize Gemini only if key exists
    const apiKey = (process.env.GOOGLE_AI_API_KEY || '').trim();
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    console.log('Generating quiz using Gemini 2.5 Flash...');
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64')
        }
      },
      //When the hackathon theme drops, only change the prompt text inside this function. Everything else stays the same.
      `Generate 10 quiz questions from this PDF.
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
      "correct": "A",
      "explanation": "why the correct answer is right"
    }
  ]
}`
    ])
    
    const raw = result.response.text()
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}
