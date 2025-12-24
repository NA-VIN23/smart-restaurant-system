import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse } from '../utils/helpers';

export const getTableAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [analytics] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM table_analytics'
    );

    const [totalStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) as reserved,
        ROUND(AVG(capacity), 2) as avg_capacity
       FROM restaurant_tables`
    );

    res.status(200).json(successResponse('Analytics retrieved successfully', {
      by_type: analytics,
      overall: totalStats[0]
    }));
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json(errorResponse('Failed to get analytics', (error as Error).message));
  }
};

export const getUserStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        role,
        COUNT(*) as count
       FROM users
       GROUP BY role`
    );

    const [totalUsers] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM users'
    );

    res.status(200).json(successResponse('User statistics retrieved successfully', {
      by_role: stats,
      total_users: totalUsers[0].total
    }));
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json(errorResponse('Failed to get user statistics', (error as Error).message));
  }
};

export const getQueueAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [queueStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_in_queue,
        MIN(queue_position) as first_position,
        MAX(queue_position) as last_position,
        ROUND(AVG(capacity), 2) as avg_capacity_in_queue
       FROM restaurant_tables
       WHERE queue_position IS NOT NULL`
    );

    const [reservationStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN reservation_time > NOW() THEN 1 END) as upcoming_reservations,
        COUNT(CASE WHEN reservation_time <= NOW() THEN 1 END) as past_due_reservations
       FROM restaurant_tables
       WHERE reservation_time IS NOT NULL`
    );

    res.status(200).json(successResponse('Queue analytics retrieved successfully', {
      queue: queueStats[0],
      reservations: reservationStats[0]
    }));
  } catch (error) {
    console.error('Get queue analytics error:', error);
    res.status(500).json(errorResponse('Failed to get queue analytics', (error as Error).message));
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Table stats
    const [tableStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) as reserved
       FROM restaurant_tables`
    );

    // Queue stats
    const [queueCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM restaurant_tables WHERE queue_position IS NOT NULL'
    );

    // Reservation stats
    const [reservationCount] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM restaurant_tables 
       WHERE reservation_time IS NOT NULL AND reservation_time > NOW()`
    );

    // User stats
    const [userCount] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM users'
    );

    res.status(200).json(successResponse('Dashboard statistics retrieved successfully', {
      tables: tableStats[0],
      queue_length: queueCount[0].count,
      upcoming_reservations: reservationCount[0].count,
      total_users: userCount[0].count
    }));
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(errorResponse('Failed to get dashboard statistics', (error as Error).message));
  }
};