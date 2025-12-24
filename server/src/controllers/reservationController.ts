import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { AuthRequest, ReservationRequest, TableStatus } from '../types';
import { successResponse, errorResponse, isFutureDate } from '../utils/helpers';

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { table_id, reservation_time, notes } = req.body as ReservationRequest;
  const userId = req.user!.id;

  if (!table_id || !reservation_time) {
    res.status(400).json(errorResponse('Table ID and reservation time are required'));
    return;
  }

  const reservationDate = new Date(reservation_time);

  if (!isFutureDate(reservationDate)) {
    res.status(400).json(errorResponse('Reservation time must be in the future'));
    return;
  }

  try {
    // Check if table exists and is available
    const [tables] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [table_id]
    );

    if (tables.length === 0) {
      res.status(404).json(errorResponse('Table not found'));
      return;
    }

    if (tables[0].status !== TableStatus.AVAILABLE) {
      res.status(400).json(errorResponse('Table is not available for reservation'));
      return;
    }

    // Check for conflicting reservations (within 2 hours)
    const twoHoursBefore = new Date(reservationDate.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(reservationDate.getTime() + 2 * 60 * 60 * 1000);

    const [conflicts] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM restaurant_tables 
       WHERE id = ? AND reservation_time IS NOT NULL 
       AND reservation_time BETWEEN ? AND ?`,
      [table_id, twoHoursBefore, twoHoursAfter]
    );

    if (conflicts.length > 0) {
      res.status(409).json(errorResponse('Table already has a reservation at this time'));
      return;
    }

    // Get user name
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );

    // Create reservation
    await pool.query(
      `UPDATE restaurant_tables 
       SET status = ?, current_customer_id = ?, current_customer_name = ?, 
           reservation_time = ?, notes = ?
       WHERE id = ?`,
      [TableStatus.RESERVED, userId, users[0].name, reservationDate, notes || null, table_id]
    );

    const [reservation] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [table_id]
    );

    res.status(201).json(successResponse('Reservation created successfully', reservation[0]));
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json(errorResponse('Failed to create reservation', (error as Error).message));
  }
};

export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const [reservations] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM restaurant_tables 
       WHERE current_customer_id = ? AND status = ? AND reservation_time IS NOT NULL
       ORDER BY reservation_time`,
      [userId, TableStatus.RESERVED]
    );

    res.status(200).json(successResponse('Reservations retrieved successfully', reservations));
  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json(errorResponse('Failed to get reservations', (error as Error).message));
  }
};

export const getAllReservations = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [reservations] = await pool.query<RowDataPacket[]>(
      `SELECT rt.*, u.email, u.contact_info
       FROM restaurant_tables rt
       LEFT JOIN users u ON rt.current_customer_id = u.id
       WHERE rt.status = ? AND rt.reservation_time IS NOT NULL
       ORDER BY rt.reservation_time`,
      [TableStatus.RESERVED]
    );

    res.status(200).json(successResponse('All reservations retrieved successfully', reservations));
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json(errorResponse('Failed to get all reservations', (error as Error).message));
  }
};

export const updateReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const { reservation_time, notes } = req.body as Partial<ReservationRequest>;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  try {
    // Get current reservation
    const [reservations] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ? AND status = ? AND reservation_time IS NOT NULL',
      [id, TableStatus.RESERVED]
    );

    if (reservations.length === 0) {
      res.status(404).json(errorResponse('Reservation not found'));
      return;
    }

    // Check ownership (unless manager/admin)
    if (userRole === 'Customer' && reservations[0].current_customer_id !== userId) {
      res.status(403).json(errorResponse('You can only update your own reservations'));
      return;
    }

    const updates: any = {};
    if (reservation_time) {
      const newDate = new Date(reservation_time);
      if (!isFutureDate(newDate)) {
        res.status(400).json(errorResponse('Reservation time must be in the future'));
        return;
      }
      updates.reservation_time = newDate;
    }
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
      res.status(400).json(errorResponse('No fields to update'));
      return;
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`);
    const values = [...Object.values(updates), id];

    await pool.query(
      `UPDATE restaurant_tables SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ?',
      [id]
    );

    res.status(200).json(successResponse('Reservation updated successfully', updated[0]));
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json(errorResponse('Failed to update reservation', (error as Error).message));
  }
};

export const cancelReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;
  const userRole = req.user!.role;

  try {
    const [reservations] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM restaurant_tables WHERE id = ? AND status = ? AND reservation_time IS NOT NULL',
      [id, TableStatus.RESERVED]
    );

    if (reservations.length === 0) {
      res.status(404).json(errorResponse('Reservation not found'));
      return;
    }

    // Check ownership (unless manager/admin)
    if (userRole === 'Customer' && reservations[0].current_customer_id !== userId) {
      res.status(403).json(errorResponse('You can only cancel your own reservations'));
      return;
    }

    await pool.query(
      `UPDATE restaurant_tables 
       SET status = ?, current_customer_id = NULL, current_customer_name = NULL, 
           reservation_time = NULL, notes = NULL
       WHERE id = ?`,
      [TableStatus.AVAILABLE, id]
    );

    res.status(200).json(successResponse('Reservation cancelled successfully'));
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json(errorResponse('Failed to cancel reservation', (error as Error).message));
  }
};