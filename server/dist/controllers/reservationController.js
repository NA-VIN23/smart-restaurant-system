"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReservation = exports.updateReservation = exports.getAllReservations = exports.getMyReservations = exports.createReservation = void 0;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const createReservation = async (req, res) => {
    const { table_id, reservation_time, notes } = req.body;
    const userId = req.user.id;
    if (!table_id || !reservation_time) {
        res.status(400).json((0, helpers_1.errorResponse)('Table ID and reservation time are required'));
        return;
    }
    const reservationDate = new Date(reservation_time);
    if (!(0, helpers_1.isFutureDate)(reservationDate)) {
        res.status(400).json((0, helpers_1.errorResponse)('Reservation time must be in the future'));
        return;
    }
    try {
        // Check if table exists and is available
        const [tables] = await database_1.default.query('SELECT * FROM restaurant_tables WHERE id = ?', [table_id]);
        if (tables.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Table not found'));
            return;
        }
        if (tables[0].status !== types_1.TableStatus.AVAILABLE) {
            res.status(400).json((0, helpers_1.errorResponse)('Table is not available for reservation'));
            return;
        }
        // Check for conflicting reservations (within 2 hours)
        const twoHoursBefore = new Date(reservationDate.getTime() - 2 * 60 * 60 * 1000);
        const twoHoursAfter = new Date(reservationDate.getTime() + 2 * 60 * 60 * 1000);
        const [conflicts] = await database_1.default.query(`SELECT id FROM restaurant_tables 
       WHERE id = ? AND reservation_time IS NOT NULL 
       AND reservation_time BETWEEN ? AND ?`, [table_id, twoHoursBefore, twoHoursAfter]);
        if (conflicts.length > 0) {
            res.status(409).json((0, helpers_1.errorResponse)('Table already has a reservation at this time'));
            return;
        }
        // Get user name
        const [users] = await database_1.default.query('SELECT name FROM users WHERE id = ?', [userId]);
        // Create reservation
        await database_1.default.query(`UPDATE restaurant_tables 
       SET status = ?, current_customer_id = ?, current_customer_name = ?, 
           reservation_time = ?, notes = ?
       WHERE id = ?`, [types_1.TableStatus.RESERVED, userId, users[0].name, reservationDate, notes || null, table_id]);
        const [reservation] = await database_1.default.query('SELECT * FROM restaurant_tables WHERE id = ?', [table_id]);
        res.status(201).json((0, helpers_1.successResponse)('Reservation created successfully', reservation[0]));
    }
    catch (error) {
        console.error('Create reservation error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to create reservation', error.message));
    }
};
exports.createReservation = createReservation;
const getMyReservations = async (req, res) => {
    const userId = req.user.id;
    try {
        const [reservations] = await database_1.default.query(`SELECT * FROM restaurant_tables 
       WHERE current_customer_id = ? AND status = ? AND reservation_time IS NOT NULL
       ORDER BY reservation_time`, [userId, types_1.TableStatus.RESERVED]);
        res.status(200).json((0, helpers_1.successResponse)('Reservations retrieved successfully', reservations));
    }
    catch (error) {
        console.error('Get my reservations error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to get reservations', error.message));
    }
};
exports.getMyReservations = getMyReservations;
const getAllReservations = async (_req, res) => {
    try {
        const [reservations] = await database_1.default.query(`SELECT rt.*, u.email, u.contact_info
       FROM restaurant_tables rt
       LEFT JOIN users u ON rt.current_customer_id = u.id
       WHERE rt.status = ? AND rt.reservation_time IS NOT NULL
       ORDER BY rt.reservation_time`, [types_1.TableStatus.RESERVED]);
        res.status(200).json((0, helpers_1.successResponse)('All reservations retrieved successfully', reservations));
    }
    catch (error) {
        console.error('Get all reservations error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to get all reservations', error.message));
    }
};
exports.getAllReservations = getAllReservations;
const updateReservation = async (req, res) => {
    const { id } = req.params;
    const { reservation_time, notes } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        // Get current reservation
        const [reservations] = await database_1.default.query('SELECT * FROM restaurant_tables WHERE id = ? AND status = ? AND reservation_time IS NOT NULL', [id, types_1.TableStatus.RESERVED]);
        if (reservations.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Reservation not found'));
            return;
        }
        // Check ownership (unless manager/admin)
        if (userRole === 'Customer' && reservations[0].current_customer_id !== userId) {
            res.status(403).json((0, helpers_1.errorResponse)('You can only update your own reservations'));
            return;
        }
        const updates = {};
        if (reservation_time) {
            const newDate = new Date(reservation_time);
            if (!(0, helpers_1.isFutureDate)(newDate)) {
                res.status(400).json((0, helpers_1.errorResponse)('Reservation time must be in the future'));
                return;
            }
            updates.reservation_time = newDate;
        }
        if (notes !== undefined)
            updates.notes = notes;
        if (Object.keys(updates).length === 0) {
            res.status(400).json((0, helpers_1.errorResponse)('No fields to update'));
            return;
        }
        const fields = Object.keys(updates).map(key => `${key} = ?`);
        const values = [...Object.values(updates), id];
        await database_1.default.query(`UPDATE restaurant_tables SET ${fields.join(', ')} WHERE id = ?`, values);
        const [updated] = await database_1.default.query('SELECT * FROM restaurant_tables WHERE id = ?', [id]);
        res.status(200).json((0, helpers_1.successResponse)('Reservation updated successfully', updated[0]));
    }
    catch (error) {
        console.error('Update reservation error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to update reservation', error.message));
    }
};
exports.updateReservation = updateReservation;
const cancelReservation = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const [reservations] = await database_1.default.query('SELECT * FROM restaurant_tables WHERE id = ? AND status = ? AND reservation_time IS NOT NULL', [id, types_1.TableStatus.RESERVED]);
        if (reservations.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Reservation not found'));
            return;
        }
        // Check ownership (unless manager/admin)
        if (userRole === 'Customer' && reservations[0].current_customer_id !== userId) {
            res.status(403).json((0, helpers_1.errorResponse)('You can only cancel your own reservations'));
            return;
        }
        await database_1.default.query(`UPDATE restaurant_tables 
       SET status = ?, current_customer_id = NULL, current_customer_name = NULL, 
           reservation_time = NULL, notes = NULL
       WHERE id = ?`, [types_1.TableStatus.AVAILABLE, id]);
        res.status(200).json((0, helpers_1.successResponse)('Reservation cancelled successfully'));
    }
    catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to cancel reservation', error.message));
    }
};
exports.cancelReservation = cancelReservation;
//# sourceMappingURL=reservationController.js.map