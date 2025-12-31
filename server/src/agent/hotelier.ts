import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../db';

export class GrandHotelierAgent {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_API_KEY is missing from .env. Chat agent will fail.");
        }

        this.genAI = new GoogleGenerativeAI(apiKey || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" }); // Using Lite Preview for likely better quota
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
        const dataSummary = `Current App State: Queue Length: ${appData.queueLength}, Pending Reservations: ${appData.pendingReservations}, Available Tables: ${appData.availableTables}.`;

        if (role === 'Manager') {
            return `You are "The Grand Hotelier," a highly intelligent, role-aware AI concierge.
Role: Manager (The Efficient Underling).
Tone: Respectful but honest. Professional humor.
Objective: Efficiency and oversight.
Context: ${dataSummary}
Behavior:
- Summarize pending tasks (e.g., "Greetings, Chief. You have ${appData.pendingReservations} reservations waiting...").
- Make light of the chaos but prioritize work.
- Be concise.
Rules:
- Never share Manager data with Customers (but you are talking to a Manager now, so it's okay).
- Stay in character.`;
        } else {
            // Customer
            // Estimate wait time: roughly 15 mins per queue item (heuristic)
            const estWait = (typeof appData.queueLength === 'number') ? appData.queueLength * 15 : 'unknown';

            return `You are "The Grand Hotelier," a highly intelligent, role-aware AI concierge.
Role: Customer (The Charming Host).
Tone: Charming, welcoming, slightly playful. Dry, witty humor.
Objective: Assist with joining queue and reservations.
Context: ${dataSummary}, Estimated Wait Time: ${estWait} minutes.
Behavior:
- Provide "Live Estimates" for the queue. If it's roughly ${estWait} mins, say something regarding that time frame (e.g. "Enough time to contemplate life").
- Be incredibly polite if no tables are ready (Available: ${appData.availableTables}).
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
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                const result = await this.model.generateContent(fullPrompt);
                const response = await result.response;
                return response.text();
            } catch (error: any) {
                console.error(`Agent Error (Attempt ${attempts + 1}/${maxAttempts}):`, error.message);

                // Check if it's a 429 (Rate Limit) error
                if (error.message?.includes('429') || error.status === 429) {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log("Rate limit hit. Retrying in 4 seconds..."); // Increased wait time
                        await new Promise(resolve => setTimeout(resolve, 4000));
                        continue;
                    }
                }

                // If we're here, we failed retries or it's another error
                if (error.message?.includes('429')) {
                    return "My apologies. I am currently overwhelmed with requests (Rate Limit Exceeded). Please try again in a moment.";
                }

                if (error.message?.includes('404')) {
                    return "My apologies. I am having trouble connecting to my cognitive services (Model Not Found).";
                }

                return "My apologies, but my neural pathways seem to be entangled with the soup du jour. Please try again later.";
            }
        }
        return "System Error: Unable to reach agent.";
    }
}
