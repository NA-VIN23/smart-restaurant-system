
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct "listModels" on the instance in some SDK versions, 
        // but let's try to just run a simple prompt on a few common names to see which succeeds.
        // Actually, checking the docs, listModels usually requires `GoogleAIFileManager` or similar, 
        // BUT simply trying to generate content is a better test.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro",
            "models/gemini-1.5-flash",
            "gemini-1.0-pro"
        ];

        console.log("Testing models...");
        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}: `);
            try {
                const m = genAI.getGenerativeModel({ model: modelName });
                const result = await m.generateContent("Hello");
                const response = await result.response;
                console.log("SUCCESS ✅");
            } catch (e) {
                console.log(`FAILED ❌ ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Critical Error", error);
    }
}

listModels();
