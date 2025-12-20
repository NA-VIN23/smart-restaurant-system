import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface QueueEntry {
  id: number;
  user_id: number;
  party_size: number;
  status: 'waiting' | 'seated' | 'cancelled' | 'no-show';
  queue_position: number;
  estimated_wait_time: number | null;
  created_at: Date;
  updated_at?: Date;
}

// Constants
const AVERAGE_SEATING_TIME = 45; // minutes per table
const CLEANING_TIME = 15; // minutes between seatings

// Helper function to calculate estimated wait time
export const calculateWaitTime = async (partySize: number): Promise<number> => {
  try {
    // Get all tables that can accommodate the party
    const [tables] = await pool.query(
      'SELECT * FROM tables WHERE capacity >= ? ORDER BY capacity ASC',
      [partySize]
    );

    if (!Array.isArray(tables) || tables.length === 0) {
      // If no tables can accommodate, return a high wait time
      return 120; // 2 hours
    }

    // Get all active reservations and queue entries
    const [reservations] = await pool.query(
      `SELECT * FROM reservations 
       WHERE status IN ('confirmed', 'seated') 
       AND reservation_time >= NOW() 
       AND reservation_time <= DATE_ADD(NOW(), INTERVAL 4 HOUR)
       ORDER BY reservation_time`
    );

    const [queueEntries] = await pool.query(
      `SELECT * FROM queue 
       WHERE status = 'waiting' 
       ORDER BY created_at`
    ) as [QueueEntry[], any];

    // Calculate estimated wait time
    let estimatedWait = 0;
    const availableTables = [...tables] as any[];
    
    // Process current reservations
    if (Array.isArray(reservations) && reservations.length > 0) {
      for (const res of reservations) {
        const resTime = new Date(res.reservation_time).getTime();
        const now = new Date().getTime();
        
        if (resTime > now) {
          // If the reservation is in the future, add to the wait time
          estimatedWait += AVERAGE_SEATING_TIME + CLEANING_TIME;
        } else if (res.status === 'seated') {
          // If the table is currently occupied, estimate remaining time
          const elapsedMinutes = Math.floor((now - resTime) / (1000 * 60));
          estimatedWait += Math.max(0, AVERAGE_SEATING_TIME - elapsedMinutes) + CLEANING_TIME;
        }
      }
    }

    // Process queue entries
    if (Array.isArray(queueEntries) && queueEntries.length > 0) {
      for (const _entry of queueEntries) {
        estimatedWait += AVERAGE_SEATING_TIME + CLEANING_TIME;
      }
    }

    // Calculate average wait time per table
    const avgWaitPerTable = estimatedWait / Math.max(1, availableTables.length);
    return Math.ceil(avgWaitPerTable);
  } catch (err) {
    console.error('Error calculating wait time:', err);
    return 60; // Default to 1 hour if there's an error
  }
};

export const joinQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, party_size, contact_number } = req.body;

    // Validate input
    if (!user_id || !party_size) {
      return next(new AppError('User ID and party size are required', 400));
    }

    // Check if user is already in the queue
    const [existingEntries] = await pool.query(
      'SELECT * FROM queue WHERE user_id = ? AND status = ?',
      [user_id, 'waiting']
    );

    if (Array.isArray(existingEntries) && existingEntries.length > 0) {
      return next(new AppError('You are already in the queue', 400));
    }

    // Get current queue position
    const [queueCount] = await pool.query(
      'SELECT COUNT(*) as count FROM queue WHERE status = ?',
      ['waiting']
    ) as any;

    const queuePosition = (queueCount[0]?.count || 0) + 1;
    
    // Calculate estimated wait time
    const estimatedWaitTime = await calculateWaitTime(party_size);

    // Add to queue
    const [result] = await pool.query(
      `INSERT INTO queue 
       (user_id, party_size, status, queue_position, estimated_wait_time, contact_number)
       VALUES (?, ?, 'waiting', ?, ?, ?)`,
      [user_id, party_size, queuePosition, estimatedWaitTime, contact_number || null]
    );

    // Get the queue entry
    const [queueEntries] = await pool.query(
      'SELECT * FROM queue WHERE id = ?',
      [(result as any).insertId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        queue: Array.isArray(queueEntries) ? queueEntries[0] : queueEntries,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getQueue = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [queueEntries] = await pool.query(
      `SELECT q.*, u.name, u.email 
       FROM queue q
       JOIN users u ON q.user_id = u.id
       WHERE q.status = 'waiting'
       ORDER BY q.created_at`
    );

    res.status(200).json({
      status: 'success',
      results: Array.isArray(queueEntries) ? queueEntries.length : 0,
      data: {
        queue: queueEntries,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getQueuePosition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const [queueEntries] = await pool.query(
      `SELECT * FROM queue 
       WHERE user_id = ? AND status = 'waiting'
       ORDER BY created_at
       LIMIT 1`,
      [userId]
    );

    if (!Array.isArray(queueEntries) || queueEntries.length === 0) {
      return next(new AppError('No active queue entry found for this user', 404));
    }

    const queueEntry = queueEntries[0] as any;
    
    // Calculate estimated wait time based on position
    const [aheadInQueue] = await pool.query(
      `SELECT COUNT(*) as count FROM queue 
       WHERE status = 'waiting' AND created_at < ?`,
      [queueEntry.created_at]
    ) as any;

    const estimatedWaitTime = (aheadInQueue[0]?.count || 0) * (AVERAGE_SEATING_TIME + CLEANING_TIME);

    res.status(200).json({
      status: 'success',
      data: {
        position: queueEntry.queue_position,
        estimatedWaitTime,
        totalAhead: aheadInQueue[0]?.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateQueueStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;

    // Validate status
    const validStatuses = ['waiting', 'seated', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    // Check if queue entry exists
    const [queueEntries] = await pool.query(
      'SELECT * FROM queue WHERE id = ?',
      [id]
    );

    if (!Array.isArray(queueEntries) || queueEntries.length === 0) {
      return next(new AppError('No queue entry found with that ID', 404));
    }

    const queueEntry = queueEntries[0] as any;

    // Update queue status
    await pool.query(
      'UPDATE queue SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // If status is 'seated', update the table status
    if (status === 'seated' && tableId) {
      await pool.query(
        'UPDATE tables SET status = ? WHERE id = ?',
        ['occupied', tableId]
      );

      // Create a reservation record for tracking
      await pool.query(
        `INSERT INTO reservations 
         (user_id, table_id, reservation_time, party_size, status)
         VALUES (?, ?, NOW(), ?, 'seated')`,
        [queueEntry.user_id, tableId, queueEntry.party_size]
      );
    }

    // If status is changed from 'waiting', update queue positions
    if (queueEntry.status === 'waiting' && status !== 'waiting') {
      await pool.query(
        `UPDATE queue SET queue_position = queue_position - 1
         WHERE status = ? AND queue_position > ?`,
        ['waiting', queueEntry.queue_position]
      );
    }

    // Get the updated queue entry
    const [updatedEntries] = await pool.query(
      'SELECT * FROM queue WHERE id = ?',
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        queue: Array.isArray(updatedEntries) ? updatedEntries[0] : updatedEntries,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const leaveQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if queue entry exists
    const [queueEntries] = await pool.query(
      'SELECT * FROM queue WHERE id = ?',
      [id]
    );

    if (!Array.isArray(queueEntries) || queueEntries.length === 0) {
      return next(new AppError('No queue entry found with that ID', 404));
    }

    const queueEntry = queueEntries[0] as any;

    // Update queue status to 'cancelled'
    await pool.query(
      "UPDATE queue SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Update queue positions for remaining entries
    if (queueEntry.status === 'waiting') {
      await pool.query(
        `UPDATE queue SET queue_position = queue_position - 1
         WHERE status = ? AND queue_position > ?`,
        ['waiting', queueEntry.queue_position]
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
