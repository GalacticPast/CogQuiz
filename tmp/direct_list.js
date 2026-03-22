async function listModels() {
    const fs = require("fs");
    const path = require("path");
    const envPath = path.resolve(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    let apiKey = "";
    envContent.split("\n").forEach(line => {
        if (line.includes("GOOGLE_AI_API_KEY=")) {
            apiKey = line.split("=")[1].trim();
        }
    });

    console.log("Using API Key:", apiKey ? "FOUND" : "MISSING", "Length:", apiKey.length);
    if (!apiKey) return;

    try {
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        console.log("Fetching models...");
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            console.log("Model names found:");
            data.models.forEach(m => console.log(`'${m.name}'`));
        } else {
            console.log("No models. Response:", data);
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

listModels();
