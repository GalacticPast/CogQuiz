const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent("Test");
    console.log("SUCCESS:", result.response.text());
  } catch (e) {
    console.log("FAILED:", e.message);
  }
}
run();
