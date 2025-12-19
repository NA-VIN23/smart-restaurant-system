
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Register User
export const register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role, contact_info } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
    }

    try {
        // Check if user exists
        const [existingUsers] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.query<ResultSetHeader>(
            'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, contact_info || '']
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login User
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Missing email or password' });
        return;
    }

    try {
        // Find user
        const [users] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
