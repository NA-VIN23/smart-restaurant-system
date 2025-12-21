
import { Request, Response } from 'express';
import { db } from '../db';
import { ResultSetHeader } from 'mysql2';

// 1. Get all tables
export const getTables = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM restaurant_tables');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching tables' });
    }
};

// 2. Add a new table
export const addTable = async (req: Request, res: Response) => {
    const { table_number, capacity, type, status } = req.body;

    if (!table_number || !capacity) {
        res.status(400).json({ message: 'Table number and capacity are required' });
        return;
    }

    const cap = parseInt(capacity);
    if (cap > 20) {
        res.status(400).json({ message: 'Capacity cannot exceed 20' });
        return;
    }

    try {
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO restaurant_tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?)',
            [table_number, cap, type || 'Regular', status || 'Available']
        );
        res.status(201).json({ message: 'Table added successfully', id: result.insertId });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Table number already exists' });
            return;
        }
        res.status(500).json({ message: 'Server Error adding table' });
    }
};

// 3. Update a table
export const updateTable = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { table_number, capacity, type, status } = req.body;

    const cap = parseInt(capacity);
    if (cap > 20) {
        res.status(400).json({ message: 'Capacity cannot exceed 20' });
        return;
    }

    try {
        await db.query(
            'UPDATE restaurant_tables SET table_number = ?, capacity = ?, type = ?, status = ? WHERE id = ?',
            [table_number, cap, type, status, id]
        );
        res.json({ message: 'Table updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating table' });
    }
};

// 4. Delete a table
export const deleteTable = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM restaurant_tables WHERE id = ?', [id]);
        res.json({ message: 'Table deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error deleting table' });
    }
};