
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const fs = require('fs');
const path = require('path');

async function main() {
    const key = process.env.GOOGLE_API_KEY;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();

        let output = "";
        if (data.models) {
            output += "AVAILABLE GEMINI MODELS:\n";
            data.models.forEach(m => {
                if (m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                    output += `- ${m.name}\n`;
                }
            });
        } else {
            output += "ERROR: " + JSON.stringify(data, null, 2);
        }

        fs.writeFileSync(path.join(__dirname, '../available_models.txt'), output);
        console.log("Model list written to available_models.txt");

    } catch (e) {
        console.error("FETCH ERROR:", e);
    }
}

main();
