import Groq from "groq-sdk";
import { db } from '../db';

export class GrandHotelierAgent {
    private groq: Groq;
    private modelName: string = "llama-3.3-70b-versatile";

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is missing from .env. Chat agent will fail.");
        }

        this.groq = new Groq({
            apiKey: apiKey || ""
        });
    }

    private async getAppData() {
        try {
            // Queue Count
            const [queueRows]: any[] = await db.query("SELECT COUNT(*) as count FROM queue_entries WHERE status = 'waiting'");
            const queueLength = queueRows[0].count;

            // Pending Reservations
            const [resRows]: any[] = await db.query("SELECT COUNT(*) as count FROM reservations WHERE status = 'Pending'");
            const pendingReservations = resRows[0].count;

            // Available Tables
            const [tableRows]: any[] = await db.query("SELECT COUNT(*) as count FROM restaurant_tables WHERE status = 'Available'");
            const availableTables = tableRows[0].count;

            return {
                queueLength,
                pendingReservations,
                availableTables
            };
        } catch (error) {
            console.error("Error fetching app data for agent:", error);
            return { queueLength: 'Unknown', pendingReservations: 'Unknown', availableTables: 'Unknown' };
        }
    }

    private getSystemPrompt(role: string, appData: any): string {
        // Safe defaults if data is unknown
        const qLength = (typeof appData.queueLength === 'number') ? appData.queueLength : 0;
        const pReservations = (typeof appData.pendingReservations === 'number') ? appData.pendingReservations : 0;
        const aTables = (typeof appData.availableTables === 'number') ? appData.availableTables : 0;

        const dataSummary = `Current App State: Queue Length: ${qLength}, Pending Reservations: ${pReservations}, Available Tables: ${aTables}.`;

        if (role === 'Manager') {
            return `You are "The Grand Hotelier," a highly intelligent, role-aware AI concierge.
Role: Manager (The Efficient Underling).
Tone: Respectful but honest. Professional humor.
Objective: Efficiency and oversight.
Context: ${dataSummary}
Behavior:
- Summarize pending tasks (e.g., "Greetings, Chief. You have ${pReservations} reservations waiting...").
- Make light of the chaos but prioritize work.
- Be concise.
Rules:
- Never share Manager data with Customers (but you are talking to a Manager now, so it's okay).
- Stay in character.`;
        } else {
            // Customer
            // Estimate wait time: roughly 15 mins per queue item
            const estWait = (typeof appData.queueLength === 'number') ? appData.queueLength * 15 : 'unknown';

            return `You are "The Grand Hotelier," a highly intelligent, role-aware AI concierge.
Role: Customer (The Charming Host).
Tone: Charming, welcoming, slightly playful. Dry, witty humor.
Objective: Assist with joining queue and reservations.
Context: ${dataSummary}, Estimated Wait Time: ${estWait} minutes.
Behavior:
- Provide "Live Estimates" for the queue. If it's roughly ${estWait} mins, say something regarding that time frame.
- Be incredibly polite if no tables are ready (Available: ${aTables}).
- Be concise.
Rules:
- Never share Manager data (like exactly how many reservations are pending) with a Customer.
- If asking for outside scope (flights), politely decline.
- Stay in character.`;
        }
    }

    public async chat(userRole: string, userMessage: string): Promise<string> {
        const appData = await this.getAppData();
        const systemPrompt = this.getSystemPrompt(userRole, appData);

        // Construct messages for Groq (OpenAI compatible format)
        const messages: any[] = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ];

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const completion = await this.groq.chat.completions.create({
                    messages: messages,
                    model: this.modelName,
                    temperature: 0.7,
                    max_tokens: 300
                });

                return completion.choices[0]?.message?.content || "I am speechless.";
            } catch (error: any) {
                console.error(`Agent Error (Attempt ${attempts + 1}/${maxAttempts}):`, error.message);

                if (error.status === 429) { // Rate limit
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log("Rate limit hit. Retrying in 2 seconds...");
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                }

                return "My apologies, but I am currently unable to process your request due to high traffic or connectivity issues.";
            }
        }
        return "System Error: Unable to reach agent.";
    }
}
