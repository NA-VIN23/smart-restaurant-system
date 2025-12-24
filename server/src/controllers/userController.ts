import type { Request, Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';
import { UserRole } from '../types';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, contact_info, created_at FROM users ORDER BY id');
    res.status(200).json(successResponse('Users retrieved successfully', users));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json(errorResponse('Failed to retrieve users', (error as Error).message));
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }
    res.status(200).json(successResponse('User retrieved successfully', users[0]));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json(errorResponse('Failed to retrieve user', (error as Error).message));
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, contact_info, role } = req.body;

  if (role && !Object.values(UserRole).includes(role)) {
    res.status(400).json(errorResponse('Invalid role'));
    return;
  }

  try {
    const fields: string[] = [];
    const values: any[] = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (contact_info !== undefined) { fields.push('contact_info = ?'); values.push(contact_info); }
    if (role !== undefined) { fields.push('role = ?'); values.push(role); }

    if (fields.length === 0) {
      res.status(400).json(errorResponse('No fields to update'));
      return;
    }

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    const [updated] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [id]);
    res.status(200).json(successResponse('User updated successfully', updated[0]));
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json(errorResponse('Failed to update user', (error as Error).message));
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }
    res.status(200).json(successResponse('User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(errorResponse('Failed to delete user', (error as Error).message));
  }
};

export default {};
