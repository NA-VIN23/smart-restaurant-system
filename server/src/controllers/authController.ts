import type { Request, Response } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import type { LoginRequest, RegisterRequest, User } from '../types';
import { UserRole } from '../types';
import { hashPassword, comparePassword, generateToken, successResponse, errorResponse, validateEmail, validatePassword } from '../utils/helpers';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role, contact_info }: RegisterRequest = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    res.status(400).json(errorResponse('Name, email, password, and role are required'));
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json(errorResponse('Invalid email format'));
    return;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    res.status(400).json(errorResponse(passwordValidation.message!));
    return;
  }

  if (!Object.values(UserRole).includes(role as UserRole)) {
    res.status(400).json(errorResponse('Invalid role. Must be Customer, Manager, or Admin'));
    return;
  }

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      res.status(409).json(errorResponse('User with this email already exists'));
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, contact_info || null]
    );

    // Generate token
    const token = generateToken({ id: result.insertId, email, role });

    res.status(201).json(successResponse('User registered successfully', {
      user: {
        id: result.insertId,
        name,
        email,
        role,
        contact_info
      },
      token
    }));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(errorResponse('Failed to register user', (error as Error).message));
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginRequest = req.body;

  // Validation
  if (!email || !password) {
    res.status(400).json(errorResponse('Email and password are required'));
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json(errorResponse('Invalid email format'));
    return;
  }

  try {
    // Get user
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      res.status(401).json(errorResponse('Invalid email or password'));
      return;
    }

    const user = users[0] as unknown as User & { password?: string };

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password as string);

    if (!isPasswordValid) {
      res.status(401).json(errorResponse('Invalid email or password'));
      return;
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(200).json(successResponse('Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact_info: user.contact_info
      },
      token
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(errorResponse('Failed to login', (error as Error).message));
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user;
  if (!user || !user.id) {
    res.status(401).json(errorResponse('Unauthorized'));
    return;
  }
  const userId = user.id;

  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    res.status(200).json(successResponse('Profile retrieved successfully', users[0]));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(errorResponse('Failed to retrieve profile', (error as Error).message));
  }
};