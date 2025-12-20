import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface Table {
  id: number;
  table_number: number;
  capacity: number;
  type: 'regular' | 'vip';
  status: 'available' | 'occupied' | 'reserved';
  created_at: Date;
  updated_at?: Date;
}

export const createTable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { table_number, capacity, type = 'regular' } = req.body;

    // Validate input
    if (!table_number || !capacity) {
      return next(new AppError('Table number and capacity are required', 400));
    }

    // Check if table number already exists
    const [existingTables] = await pool.query(
      'SELECT * FROM tables WHERE table_number = ?',
      [table_number]
    );

    if (Array.isArray(existingTables) && existingTables.length > 0) {
      return next(new AppError('Table with this number already exists', 400));
    }

    // Create new table
    const [result] = await pool.query(
      'INSERT INTO tables (table_number, capacity, type, status) VALUES (?, ?, ?, ?)',
      [table_number, capacity, type, 'available']
    );

    // Get the newly created table
    const [newTable] = await pool.query('SELECT * FROM tables WHERE id = ?', [
      (result as any).insertId,
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        table: Array.isArray(newTable) ? newTable[0] : newTable,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllTables = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [tables] = await pool.query('SELECT * FROM tables ORDER BY table_number');
    
    res.status(200).json({
      status: 'success',
      results: Array.isArray(tables) ? tables.length : 0,
      data: {
        tables,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const [tables] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);

    if (!Array.isArray(tables) || tables.length === 0) {
      return next(new AppError('No table found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        table: tables[0],
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateTable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { table_number, capacity, type, status } = req.body;

    // Check if table exists
    const [existingTables] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);

    if (!Array.isArray(existingTables) || existingTables.length === 0) {
      return next(new AppError('No table found with that ID', 404));
    }

    // Check if table number is being updated and already exists
    if (table_number) {
      const [tablesWithNumber] = await pool.query(
        'SELECT * FROM tables WHERE table_number = ? AND id != ?',
        [table_number, id]
      );

      if (Array.isArray(tablesWithNumber) && tablesWithNumber.length > 0) {
        return next(new AppError('Table with this number already exists', 400));
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const queryParams: any[] = [];

    if (table_number) {
      updateFields.push('table_number = ?');
      queryParams.push(table_number);
    }

    if (capacity) {
      updateFields.push('capacity = ?');
      queryParams.push(capacity);
    }

    if (type) {
      updateFields.push('type = ?');
      queryParams.push(type);
    }

    if (status) {
      updateFields.push('status = ?');
      queryParams.push(status);
    }

    if (updateFields.length === 0) {
      return next(new AppError('No valid fields to update', 400));
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');

    const query = `UPDATE tables SET ${updateFields.join(', ')} WHERE id = ?`;
    queryParams.push(id);

    await pool.query(query, queryParams);

    // Get the updated table
    const [updatedTables] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      data: {
        table: Array.isArray(updatedTables) ? updatedTables[0] : updatedTables,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTable = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if table exists
    const [existingTables] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);

    if (!Array.isArray(existingTables) || existingTables.length === 0) {
      return next(new AppError('No table found with that ID', 404));
    }

    // Check if table is currently in use
    const table = existingTables[0] as any;
    if (table.status !== 'available') {
      return next(
        new AppError('Cannot delete a table that is currently in use', 400)
      );
    }

    await pool.query('DELETE FROM tables WHERE id = ?', [id]);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getAvailableTables = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { date, time, partySize } = req.query;
    
    // Basic validation
    if (!date || !time) {
      return next(new AppError('Please provide date and time', 400));
    }

    const requestedDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(requestedDateTime.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours per reservation

    // Get all available tables that can accommodate the party size
    const [availableTables] = await pool.query(
      `SELECT t.* FROM tables t 
       WHERE t.status = 'available' 
       AND t.capacity >= ? 
       AND t.id NOT IN (
         SELECT r.table_id FROM reservations r 
         WHERE (
           (r.reservation_time BETWEEN ? AND ?) 
           OR (DATE_ADD(r.reservation_time, INTERVAL 2 HOUR) BETWEEN ? AND ?)
         )
         AND r.status IN ('confirmed', 'seated')
       )`,
      [
        partySize || 1,
        requestedDateTime,
        endDateTime,
        requestedDateTime,
        endDateTime
      ]
    );

    res.status(200).json({
      status: 'success',
      results: Array.isArray(availableTables) ? availableTables.length : 0,
      data: {
        tables: availableTables,
      },
    });
  } catch (err) {
    next(err);
  }
};
