import { Request, Response } from 'express';
import { db } from '../db';

export const joinQueue = async (req: Request, res: Response) => {
    try {
        const { userId, partySize } = req.body;
        await db.query(
            'UPDATE users SET waiting_since = NOW(), party_size = ? WHERE id = ?',
            [partySize, userId]
        );
        res.json({ message: 'Joined queue successfully' });
    } catch (error: any) { // <--- Added : any
        res.status(500).json({ error: error.message });
    }
};

export const getQueue = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, party_size, waiting_since FROM users WHERE waiting_since IS NOT NULL ORDER BY waiting_since ASC'
        );
        res.json(rows);
    } catch (error: any) { // <--- Added : any
        res.status(500).json({ error: error.message });
    }
};