
import { Request, Response } from 'express';
import { db } from '../db';
import { ResultSetHeader } from 'mysql2';

// 1. Join Queue
export const joinQueue = async (req: Request, res: Response) => {
    console.log('Backend Received Join Request Body:', req.body);
    const { user_id, name, party_size, customer_type } = req.body;

    if (!party_size || (!user_id && !name)) {
        res.status(400).json({ message: 'Party size and either User ID or Name are required' });
        return;
    }

    try {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO queue_entries (user_id, name, party_size, status, customer_type) VALUES (?, ?, ?, ?, ?)',
            [user_id || null, name || null, party_size, 'waiting', customer_type || 'Regular']
        );
        res.status(201).json({ message: 'Joined queue successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error joining queue' });
    }
};

// 2. Get Queue (Waiting only)
export const getQueue = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM queue_entries WHERE status = 'waiting' ORDER BY created_at ASC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching queue' });
    }
};

// 3. Update Queue Status (Seated/Cancelled)
export const updateQueueStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, table_id } = req.body; // 'seated' or 'cancelled', optional table_id

    try {
        // Update queue entry
        await db.query('UPDATE queue_entries SET status = ? WHERE id = ?', [status, id]);

        // If seated and table_id provided, update table status
        if (status === 'seated' && table_id) {
            await db.query('UPDATE restaurant_tables SET status = ? WHERE id = ?', ['Occupied', table_id]);
        }

        res.json({ message: `Queue entry marked as ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating queue status' });
    }
};