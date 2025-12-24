"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getQueueAnalytics = exports.getUserStats = exports.getTableAnalytics = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const getTableAnalytics = async (_req, res) => {
    try {
        const [analytics] = await database_1.default.query('SELECT * FROM table_analytics');
        const [totalStats] = await database_1.default.query(`SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) as reserved,
        ROUND(AVG(capacity), 2) as avg_capacity
       FROM restaurant_tables`);
        res.status(200).json((0, helpers_1.successResponse)('Analytics retrieved successfully', {
            by_type: analytics,
            overall: totalStats[0]
        }));
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to get analytics', error.message));
    }
};
exports.getTableAnalytics = getTableAnalytics;
const getUserStats = async (_req, res) => {
    try {
        const [stats] = await database_1.default.query(`SELECT 
        role,
        COUNT(*) as count
       FROM users
       GROUP BY role`);
        const [totalUsers] = await database_1.default.query('SELECT COUNT(*) as total FROM users');
        res.status(200).json((0, helpers_1.successResponse)('User statistics retrieved successfully', {
            by_role: stats,
            total_users: totalUsers[0].total
        }));
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to get user statistics', error.message));
    }
};
exports.getUserStats = getUserStats;
const getQueueAnalytics = async (_req, res) => {
    try {
        const [queueStats] = await database_1.default.query(`SELECT 
        COUNT(*) as total_in_queue,
        MIN(queue_position) as first_position,
        MAX(queue_position) as last_position,
        ROUND(AVG(capacity), 2) as avg_capacity_in_queue
       FROM restaurant_tables
       WHERE queue_position IS NOT NULL`);
        const [reservationStats] = await database_1.default.query(`SELECT 
        COUNT(*) as total_reservations,
        COUNT(CASE WHEN reservation_time > NOW() THEN 1 END) as upcoming_reservations,
        COUNT(CASE WHEN reservation_time <= NOW() THEN 1 END) as past_due_reservations
       FROM restaurant_tables
       WHERE reservation_time IS NOT NULL`);
        res.status(200).json((0, helpers_1.successResponse)('Queue analytics retrieved successfully', {
            queue: queueStats[0],
            reservations: reservationStats[0]
        }));
    }
    catch (error) {
        console.error('Get queue analytics error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to get queue analytics', error.message));
    }
};
exports.getQueueAnalytics = getQueueAnalytics;
const getDashboardStats = async (_req, res) => {
    try {
        // Table stats
        const [tableStats] = await database_1.default.query(`SELECT 
        COUNT(*) as total_tables,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) as reserved
       FROM restaurant_tables`);
        // Queue stats
        const [queueCount] = await database_1.default.query('SELECT COUNT(*) as count FROM restaurant_tables WHERE queue_position IS NOT NULL');
        // Reservation stats
        const [reservationCount] = await database_1.default.query(`SELECT COUNT(*) as count FROM restaurant_tables 
       WHERE reservation_time IS NOT NULL AND reservation_time > NOW()`);
        // User stats
        const [userCount] = await database_1.default.query('SELECT COUNT(*) as count FROM users');
        res.status(200).json((0, helpers_1.successResponse)('Dashboard statistics retrieved successfully', {
            tables: tableStats[0],
            queue_length: queueCount[0].count,
            upcoming_reservations: reservationCount[0].count,
            total_users: userCount[0].count
        }));
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to get dashboard statistics', error.message));
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=analyticsController.js.map