import { Request, Response } from 'express';
import { GrandHotelierAgent } from '../agent/hotelier';

const agent = new GrandHotelierAgent();

export const chatWithAgent = async (req: Request, res: Response) => {
    // Expect { message, role } in body. 
    // Securely, role should come from req.user, but for now we accept it or derive from auth.
    // If authenticated, we trust req.user.role

    const user = (req as any).user;
    const userMessage = req.body.message;

    // Determine Role: If logged in, use their role. If guest, 'Customer'.
    // If req.user is populated by authenticateToken, use it.
    let role = 'Customer';
    if (user && user.role) {
        role = user.role;
    }

    if (!userMessage) {
        res.status(400).json({ message: "Say something, darling." });
        return;
    }

    try {
        const reply = await agent.chat(role, userMessage, user?.id);
        res.json({ reply });
    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
