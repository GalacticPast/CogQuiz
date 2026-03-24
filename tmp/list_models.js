import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  try {
    const models = await genAI.listModels(); // Wait, does this exist in the current SDK?
    // In newer SDKs, it might be slightly different.
    // Let's see if we can just try a simple generateContent with a different name.
    for (const model of models) {
    }
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
