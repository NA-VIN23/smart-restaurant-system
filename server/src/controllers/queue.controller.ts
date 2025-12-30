
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
        console.log(`[${new Date().toISOString()}] Fetching Queue...`);
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
        // Update queue entry with table_id if provided
        await db.query('UPDATE queue_entries SET status = ?, table_id = ? WHERE id = ?', [status, table_id || null, id]);

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

// 4. Get My Queue Status (For Notifications)
export const getMyQueueStatus = async (req: Request, res: Response) => {
    const { query_ids } = req.query; // Expect comma separated IDs e.g. "1,2,3"

    if (!query_ids || typeof query_ids !== 'string') {
        res.json([]); // Return empty if no IDs provided
        return;
    }

    const ids = query_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (ids.length === 0) {
        res.json([]);
        return;
    }

    try {
        // Fetch queue entries + table info
        const [rows] = await db.query(
            `SELECT q.*, t.table_number 
             FROM queue_entries q 
             LEFT JOIN restaurant_tables t ON q.table_id = t.id 
             WHERE q.id IN (?)`,
            [ids]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching my queue status' });
    }
};