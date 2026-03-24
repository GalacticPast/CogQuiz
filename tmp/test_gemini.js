const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Load .env.local manually for node script
const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, value] = line.split("=");
  if (key && value) env[key.trim()] = value.trim();
});

async function testGemini() {
  const apiKey = env.GOOGLE_AI_API_KEY;
  if (!apiKey) return;

  let genAI = new GoogleGenerativeAI(apiKey);
  let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Try v1 instead of v1beta (which is the default in some versions)
  genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("Hello, are you working?");
  } catch (error) {
    try {
      const model2 = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
      });
      const result2 = await model2.generateContent("Hello?");
    } catch (err2) {}
  }
}

testGemini();
