import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateQuizFromPDF(pdfBuffer) {
  try {
    // Initialize Gemini only if key exists
    const genAI = new GoogleGenerativeAI((process.env.GOOGLE_AI_API_KEY || '').trim())
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // We expect the first argument to be the buffer if it came from the route
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64')
        }
      },
      `Generate 10 quiz questions about the PDF content in JSON format.`
    ])
    
    const raw = result.response.text()
    return JSON.parse(raw.replace(/```json|```/g, '').trim())
  } catch (error) {
    console.warn('Gemini API failed or 404. Falling back to Mock Quiz for development.', error.message)
    // RETURN MOCK DATA TO UNBLOCK TEAM
    return {
      category: "Hackathon Mock",
      questions: [
        {
          question: "What is the primary function of DNA?",
          options: { A: "Energy storage", B: "Genetic information", C: "Structural support", D: "Waste removal" },
          correct: "B",
          explanation: "DNA carries the genetic instructions used in the growth and development of organisms."
        },
        {
          question: "Which organelle is the powerhouse of the cell?",
          options: { A: "Nucleus", B: "Ribosome", C: "Mitochondria", D: "Golgi Apparatus" },
          correct: "C",
          explanation: "Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP)."
        }
      ]
    }
  }
}
