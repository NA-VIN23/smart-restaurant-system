import { Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
// Use require for the pool to avoid TS module resolution edge-cases in tests
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pool = require('../config/database').default as import('mysql2/promise').Pool;
import { AuthRequest, CreateTableRequest, UpdateTableRequest, TableStatus, TableType } from '../types';
import { successResponse, errorResponse } from '../utils/helpers';

export const getAllTables = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [tables] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables ORDER BY table_number'
    );

    res.status(200).json(successResponse('Tables retrieved successfully', tables));
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json(errorResponse('Failed to retrieve tables', (error as Error).message));
  }
};

export const getAvailableTables = async (req: AuthRequest, res: Response): Promise<void> => {
  const { capacity, type } = req.query;

  try {
    let query = 'SELECT * FROM restaurant_tables WHERE status = ?';
    const params: any[] = [TableStatus.AVAILABLE];

    if (capacity) {
      query += ' AND capacity >= ?';
      params.push(parseInt(capacity as string));
    }

    if (type && Object.values(TableType).includes(type as unknown as TableType)) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY capacity, table_number';

    const [tables] = await pool.query<RowDataPacket[]>(query, params);

    res.status(200).json(successResponse('Available tables retrieved successfully', tables));
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json(errorResponse('Failed to retrieve available tables', (error as Error).message));
  }
};

export const getTableById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [tables] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [id]
    );

    if (tables.length === 0) {
      res.status(404).json(errorResponse('Table not found'));
      return;
    }

    res.status(200).json(successResponse('Table retrieved successfully', tables[0]));
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json(errorResponse('Failed to retrieve table', (error as Error).message));
  }
};

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const { table_number, capacity, type }: CreateTableRequest = req.body;

  // Validation
  if (!table_number || !capacity) {
    res.status(400).json(errorResponse('Table number and capacity are required'));
    return;
  }

  if (capacity <= 0) {
    res.status(400).json(errorResponse('Capacity must be greater than 0'));
    return;
  }

  if (type && !Object.values(TableType).includes(type as unknown as TableType)) {
    res.status(400).json(errorResponse('Invalid table type. Must be Regular or VIP'));
    return;
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO restaurant_tables (table_number, capacity, type) VALUES (?, ?, ?)',
      [table_number, capacity, type || TableType.REGULAR]
    );

    const [newTable] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(successResponse('Table created successfully', newTable[0]));
  } catch (error: any) {
    console.error('Create table error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json(errorResponse('Table number already exists'));
      return;
    }
    res.status(500).json(errorResponse('Failed to create table', error.message));
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates: UpdateTableRequest = req.body;

  if (Object.keys(updates).length === 0) {
    res.status(400).json(errorResponse('No fields to update'));
    return;
  }

  // Validation
  if (updates.capacity !== undefined && updates.capacity <= 0) {
    res.status(400).json(errorResponse('Capacity must be greater than 0'));
    return;
  }

  if (updates.type && !Object.values(TableType).includes(updates.type as unknown as TableType)) {
    res.status(400).json(errorResponse('Invalid table type'));
    return;
  }

  if (updates.status && !Object.values(TableStatus).includes(updates.status as unknown as TableStatus)) {
    res.status(400).json(errorResponse('Invalid table status'));
    return;
  }

  try {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE restaurant_tables SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json(errorResponse('Table not found'));
      return;
    }

    const [updatedTable] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [id]
    );

    res.status(200).json(successResponse('Table updated successfully', updatedTable[0]));
  } catch (error: any) {
    console.error('Update table error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json(errorResponse('Table number already exists'));
      return;
    }
    res.status(500).json(errorResponse('Failed to update table', error.message));
  }
};

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [tables] = await pool.query<RowDataPacket[]>(
      'SELECT status FROM restaurant_tables WHERE id = ?',
      [id]
    );

    if (tables.length === 0) {
      res.status(404).json(errorResponse('Table not found'));
      return;
    }

    if (tables[0].status === TableStatus.OCCUPIED || tables[0].status === TableStatus.RESERVED) {
      res.status(400).json(errorResponse('Cannot delete occupied or reserved table'));
      return;
    }

    // FIX: removed unused variable
    await pool.query<ResultSetHeader>(
      'DELETE FROM restaurant_tables WHERE id = ?',
      [id]
    );

    res.status(200).json(successResponse('Table deleted successfully'));
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json(errorResponse('Failed to delete table', (error as Error).message));
  }
};


export const vacateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE restaurant_tables 
       SET status = ?, current_customer_id = NULL, current_customer_name = NULL, 
           reservation_time = NULL, queue_position = NULL, notes = NULL
       WHERE id = ?`,
      [TableStatus.AVAILABLE, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json(errorResponse('Table not found'));
      return;
    }

    res.status(200).json(successResponse('Table vacated successfully'));
  } catch (error) {
    console.error('Vacate table error:', error);
    res.status(500).json(errorResponse('Failed to vacate table', (error as Error).message));
  }
};