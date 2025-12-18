import { Request, Response } from 'express';
import { db } from '../db'; // Import the connection we just made

// 1. Get all tables
export const getTables = async (req: Request, res: Response) => {
    try {
        // Strict SQL matching your Schema
        const [rows] = await db.query('SELECT * FROM restaurant_tables');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching tables' });
    }
};