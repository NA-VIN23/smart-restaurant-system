import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { getIO } from '../socket';
import { AppError } from '../middleware/error.middleware';

export interface Reservation {
  id: number;
  user_id: number;
  table_id: number;
  reservation_time: Date;
  party_size: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  special_requests?: string;
  created_at: Date;
  updated_at?: Date;
}

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, table_id, reservation_time, party_size, special_requests } = req.body;
    if (process.env.RUN_INTEGRATION === 'true') console.log('createReservation: body=', req.body);

    // Validate input
    if (!user_id || !table_id || !reservation_time || !party_size) {
      return next(new AppError('Missing required fields', 400));
    }

    const reservationTime = new Date(reservation_time);
    const now = new Date();
    if (process.env.RUN_INTEGRATION === 'true') console.log('createReservation: reservationTime=', reservationTime.toISOString(), 'now=', now.toISOString());

    // Check if reservation is in the future
    if (reservationTime <= now) {
      return next(new AppError('Reservation time must be in the future', 400));
    }

    // Ensure customers can only create reservations for themselves
    if (req.user && req.user.role === 'customer' && req.user.id !== user_id) {
      return next(new AppError('Customers can only create reservations for themselves', 403));
    }

    // Check if table exists and is available
    const [tables] = await pool.query('SELECT * FROM tables WHERE id = ?', [table_id]);
    
    if (!Array.isArray(tables) || tables.length === 0) {
      return next(new AppError('Table not found', 404));
    }

    const table = tables[0] as any;
    
    // Check if table can accommodate the party size
    if (table.capacity < party_size) {
      return next(new AppError('Table capacity is less than the party size', 400));
    }

    // Check for existing reservations at the same time
    const endTime = new Date(reservationTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours per reservation
    
    const [existingReservations] = await pool.query(
      `SELECT * FROM reservations 
       WHERE table_id = ? 
       AND reservation_time < ? 
       AND DATE_ADD(reservation_time, INTERVAL 2 HOUR) > ?
       AND status IN ('confirmed', 'seated')`,
      [table_id, endTime, reservationTime]
    );
    if (process.env.RUN_INTEGRATION === 'true') console.log('createReservation: existing reservations count=', Array.isArray(existingReservations) ? existingReservations.length : 0);

    if (Array.isArray(existingReservations) && existingReservations.length > 0) {
      return next(new AppError('Table is already reserved for the selected time', 400));
    }

    // Create reservation
    const [result] = await pool.query(
      `INSERT INTO reservations 
       (user_id, table_id, reservation_time, party_size, status, special_requests) 
       VALUES (?, ?, ?, ?, 'confirmed', ?)`,
      [user_id, table_id, reservationTime, party_size, special_requests || null]
    );

    // Update table status
    await pool.query(
      'UPDATE tables SET status = ? WHERE id = ?',
      ['reserved', table_id]
    );

    // Get the newly created reservation
    const [newReservation] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [(result as any).insertId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        reservation: Array.isArray(newReservation) ? newReservation[0] : newReservation,
      },
    });
    try {
      const io = getIO();
      io.emit('reservation:created', { reservation: Array.isArray(newReservation) ? newReservation[0] : newReservation });
    } catch (e) {
      // ignore socket errors
    }
  } catch (err) {
    next(err);
  }
};

export const getAllReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, date } = req.query;
    
    let query = 'SELECT * FROM reservations';
    const queryParams: any[] = [];
    
    // Add filters if provided
    const conditions: string[] = [];
    
    if (status) {
      conditions.push('status = ?');
      queryParams.push(status);
    }
    
    if (date) {
      conditions.push('DATE(reservation_time) = ?');
      queryParams.push(date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY reservation_time DESC';
    
    const [reservations] = await pool.query(query, queryParams);
    
    res.status(200).json({
      status: 'success',
      results: Array.isArray(reservations) ? reservations.length : 0,
      data: {
        reservations,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return next(new AppError('No reservation found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        reservation: reservations[0],
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reservation_time, party_size, special_requests } = req.body;

    // Check if reservation exists
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return next(new AppError('No reservation found with that ID', 404));
    }

    const reservation = reservations[0] as any;
    // Only allow customers to update their own reservations
    if (req.user && req.user.role === 'customer' && req.user.id !== reservation.user_id) {
      return next(new AppError('You do not have permission to update this reservation', 403));
    }
    
    // Only allow updates to future reservations
    const now = new Date();
    const reservationTime = new Date(reservation.reservation_time);
    
    if (reservationTime < now) {
      return next(new AppError('Cannot update past reservations', 400));
    }

    // Build update query
    const updateFields: string[] = [];
    const queryParams: any[] = [];

    if (reservation_time) {
      const newReservationTime = new Date(reservation_time);
      
      // Check if new time is in the future
      if (newReservationTime < now) {
        return next(new AppError('New reservation time must be in the future', 400));
      }
      
      updateFields.push('reservation_time = ?');
      queryParams.push(newReservationTime);
    }

    if (party_size) {
      // Check if the table can accommodate the new party size
      const [tables] = await pool.query('SELECT * FROM tables WHERE id = ?', [
        reservation.table_id,
      ]);

      if (Array.isArray(tables) && tables.length > 0) {
        const table = tables[0] as any;
        if (table.capacity < party_size) {
          return next(
            new AppError('Table capacity is less than the new party size', 400)
          );
        }
      }
      
      updateFields.push('party_size = ?');
      queryParams.push(party_size);
    }

    if (special_requests !== undefined) {
      updateFields.push('special_requests = ?');
      queryParams.push(special_requests);
    }

    if (updateFields.length === 0) {
      return next(new AppError('No valid fields to update', 400));
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');

    const query = `UPDATE reservations SET ${updateFields.join(', ')} WHERE id = ?`;
    queryParams.push(id);

    await pool.query(query, queryParams);

    // Get the updated reservation
    const [updatedReservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        reservation: Array.isArray(updatedReservations) ? updatedReservations[0] : updatedReservations,
      },
    });
    try {
      const io = getIO();
      io.emit('reservation:update', { id, status });
    } catch (e) {
      // ignore
    }
  } catch (err) {
    next(err);
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if reservation exists
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return next(new AppError('No reservation found with that ID', 404));
    }

    const reservation = reservations[0] as any;
    // Only allow customers to cancel their own future reservations
    if (req.user && req.user.role === 'customer' && req.user.id !== reservation.user_id) {
      return next(new AppError('You do not have permission to cancel this reservation', 403));
    }
    
    // Only allow cancellation of future reservations
    const now = new Date();
    const reservationTime = new Date(reservation.reservation_time);
    
    if (reservationTime < now) {
      return next(new AppError('Cannot cancel past reservations', 400));
    }

    // Update reservation status to cancelled
    await pool.query(
      "UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Update table status to available
    await pool.query(
      "UPDATE tables SET status = 'available' WHERE id = ?",
      [reservation.table_id]
    );

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    let query = 'SELECT * FROM reservations WHERE user_id = ?';
    const queryParams: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY reservation_time DESC';
    
    const [reservations] = await pool.query(query, queryParams);
    
    res.status(200).json({
      status: 'success',
      results: Array.isArray(reservations) ? reservations.length : 0,
      data: {
        reservations,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateReservationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    // Check if reservation exists
    const [reservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    if (!Array.isArray(reservations) || reservations.length === 0) {
      return next(new AppError('No reservation found with that ID', 404));
    }

    const reservation = reservations[0] as any;
    
    // Update reservation status
    await pool.query(
      'UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Update table status if needed
    if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
      await pool.query(
        "UPDATE tables SET status = 'available' WHERE id = ?",
        [reservation.table_id]
      );
    } else if (status === 'seated') {
      await pool.query(
        "UPDATE tables SET status = 'occupied' WHERE id = ?",
        [reservation.table_id]
      );
    }

    // Get the updated reservation
    const [updatedReservations] = await pool.query(
      'SELECT * FROM reservations WHERE id = ?',
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        reservation: Array.isArray(updatedReservations) ? updatedReservations[0] : updatedReservations,
      },
    });
  } catch (err) {
    next(err);
  }
};
