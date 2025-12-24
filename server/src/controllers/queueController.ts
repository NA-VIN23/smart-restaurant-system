import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { AuthRequest, JoinQueueRequest, TableStatus, TableType } from '../types';
import { successResponse, errorResponse, calculateEstimatedWaitTime } from '../utils/helpers';

export const joinQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  const { capacity_needed, type_preference } = req.body as JoinQueueRequest;
  const userId = req.user!.id;

  if (!capacity_needed || capacity_needed <= 0) {
    res.status(400).json(errorResponse('Valid capacity is required'));
    return;
  }

  try {
    // Check if user already in queue
    const [existingQueue] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM restaurant_tables WHERE current_customer_id = ? AND queue_position IS NOT NULL',
      [userId]
    );

    if (existingQueue.length > 0) {
      res.status(400).json(errorResponse('You are already in the queue'));
      return;
    }

    // Get user details
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    // Find suitable available table
    let query = `SELECT id FROM restaurant_tables 
                 WHERE status = ? AND capacity >= ?`;
    const params: any[] = [TableStatus.AVAILABLE, capacity_needed];

    if (type_preference && Object.values(TableType).includes(type_preference as TableType)) {
      query += ' AND type = ?';
      params.push(type_preference);
    }

    query += ' ORDER BY capacity LIMIT 1';

    const [availableTables] = await pool.query<RowDataPacket[]>(query, params);

    if (availableTables.length === 0) {
      res.status(404).json(errorResponse('No suitable tables available'));
      return;
    }

    const tableId = availableTables[0].id;

    // Get current max queue position
    const [maxPosition] = await pool.query<RowDataPacket[]>(
      'SELECT MAX(queue_position) as max_pos FROM restaurant_tables WHERE queue_position IS NOT NULL'
    );

    const newPosition = (maxPosition[0].max_pos || 0) + 1;

    // Add to queue
    await pool.query(
      `UPDATE restaurant_tables 
       SET status = ?, current_customer_id = ?, current_customer_name = ?, queue_position = ?
       WHERE id = ?`,
      [TableStatus.RESERVED, userId, users[0].name, newPosition, tableId]
    );

    const estimatedWait = calculateEstimatedWaitTime(newPosition);

    res.status(200).json(successResponse('Successfully joined the queue', {
      table_id: tableId,
      queue_position: newPosition,
      estimated_wait_minutes: estimatedWait
    }));
  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json(errorResponse('Failed to join queue', (error as Error).message));
  }
};

export const getQueueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const [queueEntry] = await pool.query<RowDataPacket[]>(
      `SELECT rt.*, u.email, u.contact_info 
       FROM restaurant_tables rt
       LEFT JOIN users u ON rt.current_customer_id = u.id
       WHERE rt.current_customer_id = ? AND rt.queue_position IS NOT NULL`,
      [userId]
    );

    if (queueEntry.length === 0) {
      res.status(404).json(errorResponse('You are not in the queue'));
      return;
    }

    const position = queueEntry[0].queue_position;
    const estimatedWait = calculateEstimatedWaitTime(position);

    res.status(200).json(successResponse('Queue status retrieved', {
      ...queueEntry[0],
      estimated_wait_minutes: estimatedWait
    }));
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json(errorResponse('Failed to get queue status', (error as Error).message));
  }
};

export const getAllQueueEntries = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [queue] = await pool.query<RowDataPacket[]>(
      `SELECT rt.*, u.email, u.contact_info
       FROM restaurant_tables rt
       LEFT JOIN users u ON rt.current_customer_id = u.id
       WHERE rt.queue_position IS NOT NULL
       ORDER BY rt.queue_position`
    );

    const queueWithEstimates = queue.map(entry => ({
      ...entry,
      estimated_wait_minutes: calculateEstimatedWaitTime(entry.queue_position)
    }));

    res.status(200).json(successResponse('Queue entries retrieved', queueWithEstimates));
  } catch (error) {
    console.error('Get all queue error:', error);
    res.status(500).json(errorResponse('Failed to get queue entries', (error as Error).message));
  }
};

export const leaveQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current queue entry
      const [currentEntry] = await connection.query<RowDataPacket[]>(
        'SELECT id, queue_position FROM restaurant_tables WHERE current_customer_id = ? AND queue_position IS NOT NULL',
        [userId]
      );

      if (currentEntry.length === 0) {
        await connection.rollback();
        connection.release();
        res.status(404).json(errorResponse('You are not in the queue'));
        return;
      }

      const removedPosition = currentEntry[0].queue_position;

      // Remove from queue
      await connection.query(
        `UPDATE restaurant_tables 
         SET status = ?, current_customer_id = NULL, current_customer_name = NULL, queue_position = NULL
         WHERE current_customer_id = ? AND queue_position IS NOT NULL`,
        [TableStatus.AVAILABLE, userId]
      );

      // Update positions of entries after the removed one
      await connection.query(
        'UPDATE restaurant_tables SET queue_position = queue_position - 1 WHERE queue_position > ?',
        [removedPosition]
      );

      await connection.commit();
      connection.release();

      res.status(200).json(successResponse('Successfully left the queue'));
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json(errorResponse('Failed to leave queue', (error as Error).message));
  }
};

export const seatCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { table_id } = req.body as { table_id: number };

  if (!table_id) {
    res.status(400).json(errorResponse('Table ID is required'));
    return;
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get table details
      const [tables] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM restaurant_tables WHERE id = ?',
        [table_id]
      );

      if (tables.length === 0) {
        await connection.rollback();
        connection.release();
        res.status(404).json(errorResponse('Table not found'));
        return;
      }

      const table = tables[0];

      if (!table.queue_position) {
        await connection.rollback();
        connection.release();
        res.status(400).json(errorResponse('No customer in queue for this table'));
        return;
      }

      const seatedPosition = table.queue_position;

      // Seat the customer
      await connection.query(
        'UPDATE restaurant_tables SET status = ?, queue_position = NULL WHERE id = ?',
        [TableStatus.OCCUPIED, table_id]
      );

      // Update queue positions
      await connection.query(
        'UPDATE restaurant_tables SET queue_position = queue_position - 1 WHERE queue_position > ?',
        [seatedPosition]
      );

      await connection.commit();
      connection.release();

      res.status(200).json(successResponse('Customer seated successfully'));
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Seat customer error:', error);
    res.status(500).json(errorResponse('Failed to seat customer', (error as Error).message));
  }
};