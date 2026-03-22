const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Load .env.local manually for node script
const envPath = path.resolve(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim();
});

async function testGemini() {
    const apiKey = env.GOOGLE_AI_API_KEY;
    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING");
    if (!apiKey) return;

    let genAI = new GoogleGenerativeAI(apiKey);
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Try v1 instead of v1beta (which is the default in some versions)
    genAI = new GoogleGenerativeAI(apiKey, { apiVersion: "v1" });
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Testing text generation with v1 API...");
        const result = await model.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
        console.log("SUCCESS!");
    } catch (error) {
        console.error("FAILURE with v1:", error.message);
        console.log("Trying gemini-1.5-flash-latest with v1...");
        try {
            const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const result2 = await model2.generateContent("Hello?");
            console.log("Response (latest):", result2.response.text());
            console.log("SUCCESS with latest!");
        } catch (err2) {
            console.error("FAILURE with latest:", err2.message);
        }
    }
}

testGemini();
