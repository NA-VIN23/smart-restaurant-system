"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReservationStatus = exports.getUserReservations = exports.cancelReservation = exports.updateReservation = exports.getReservation = exports.getAllReservations = exports.createReservation = void 0;
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const createReservation = async (req, res, next) => {
    try {
        const { user_id, table_id, reservation_time, party_size, special_requests } = req.body;
        if (process.env.RUN_INTEGRATION === 'true')
            console.log('createReservation: body=', req.body);
        // Validate input
        if (!user_id || !table_id || !reservation_time || !party_size) {
            return next(new error_middleware_1.AppError('Missing required fields', 400));
        }
        const reservationTime = new Date(reservation_time);
        const now = new Date();
        if (process.env.RUN_INTEGRATION === 'true')
            console.log('createReservation: reservationTime=', reservationTime.toISOString(), 'now=', now.toISOString());
        // Check if reservation is in the future
        if (reservationTime <= now) {
            return next(new error_middleware_1.AppError('Reservation time must be in the future', 400));
        }
        // Check if table exists and is available
        const [tables] = await database_1.default.query('SELECT * FROM tables WHERE id = ?', [table_id]);
        if (!Array.isArray(tables) || tables.length === 0) {
            return next(new error_middleware_1.AppError('Table not found', 404));
        }
        const table = tables[0];
        // Check if table can accommodate the party size
        if (table.capacity < party_size) {
            return next(new error_middleware_1.AppError('Table capacity is less than the party size', 400));
        }
        // Check for existing reservations at the same time
        const endTime = new Date(reservationTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours per reservation
        const [existingReservations] = await database_1.default.query(`SELECT * FROM reservations 
       WHERE table_id = ? 
       AND reservation_time < ? 
       AND DATE_ADD(reservation_time, INTERVAL 2 HOUR) > ?
       AND status IN ('confirmed', 'seated')`, [table_id, endTime, reservationTime]);
        if (process.env.RUN_INTEGRATION === 'true')
            console.log('createReservation: existing reservations count=', Array.isArray(existingReservations) ? existingReservations.length : 0);
        if (Array.isArray(existingReservations) && existingReservations.length > 0) {
            return next(new error_middleware_1.AppError('Table is already reserved for the selected time', 400));
        }
        // Create reservation
        const [result] = await database_1.default.query(`INSERT INTO reservations 
       (user_id, table_id, reservation_time, party_size, status, special_requests) 
       VALUES (?, ?, ?, ?, 'confirmed', ?)`, [user_id, table_id, reservationTime, party_size, special_requests || null]);
        // Update table status
        await database_1.default.query('UPDATE tables SET status = ? WHERE id = ?', ['reserved', table_id]);
        // Get the newly created reservation
        const [newReservation] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [result.insertId]);
        res.status(201).json({
            status: 'success',
            data: {
                reservation: Array.isArray(newReservation) ? newReservation[0] : newReservation,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createReservation = createReservation;
const getAllReservations = async (req, res, next) => {
    try {
        const { status, date } = req.query;
        let query = 'SELECT * FROM reservations';
        const queryParams = [];
        // Add filters if provided
        const conditions = [];
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
        const [reservations] = await database_1.default.query(query, queryParams);
        res.status(200).json({
            status: 'success',
            results: Array.isArray(reservations) ? reservations.length : 0,
            data: {
                reservations,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllReservations = getAllReservations;
const getReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [reservations] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [id]);
        if (!Array.isArray(reservations) || reservations.length === 0) {
            return next(new error_middleware_1.AppError('No reservation found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                reservation: reservations[0],
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getReservation = getReservation;
const updateReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reservation_time, party_size, special_requests } = req.body;
        // Check if reservation exists
        const [reservations] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [id]);
        if (!Array.isArray(reservations) || reservations.length === 0) {
            return next(new error_middleware_1.AppError('No reservation found with that ID', 404));
        }
        const reservation = reservations[0];
        // Only allow updates to future reservations
        const now = new Date();
        const reservationTime = new Date(reservation.reservation_time);
        if (reservationTime < now) {
            return next(new error_middleware_1.AppError('Cannot update past reservations', 400));
        }
        // Build update query
        const updateFields = [];
        const queryParams = [];
        if (reservation_time) {
            const newReservationTime = new Date(reservation_time);
            // Check if new time is in the future
            if (newReservationTime < now) {
                return next(new error_middleware_1.AppError('New reservation time must be in the future', 400));
            }
            updateFields.push('reservation_time = ?');
            queryParams.push(newReservationTime);
        }
        if (party_size) {
            // Check if the table can accommodate the new party size
            const [tables] = await database_1.default.query('SELECT * FROM tables WHERE id = ?', [
                reservation.table_id,
            ]);
            if (Array.isArray(tables) && tables.length > 0) {
                const table = tables[0];
                if (table.capacity < party_size) {
                    return next(new error_middleware_1.AppError('Table capacity is less than the new party size', 400));
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
            return next(new error_middleware_1.AppError('No valid fields to update', 400));
        }
        // Add updated_at timestamp
        updateFields.push('updated_at = NOW()');
        const query = `UPDATE reservations SET ${updateFields.join(', ')} WHERE id = ?`;
        queryParams.push(id);
        await database_1.default.query(query, queryParams);
        // Get the updated reservation
        const [updatedReservations] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [id]);
        res.status(200).json({
            status: 'success',
            data: {
                reservation: Array.isArray(updatedReservations) ? updatedReservations[0] : updatedReservations,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateReservation = updateReservation;
const cancelReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if reservation exists
        const [reservations] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [id]);
        if (!Array.isArray(reservations) || reservations.length === 0) {
            return next(new error_middleware_1.AppError('No reservation found with that ID', 404));
        }
        const reservation = reservations[0];
        // Only allow cancellation of future reservations
        const now = new Date();
        const reservationTime = new Date(reservation.reservation_time);
        if (reservationTime < now) {
            return next(new error_middleware_1.AppError('Cannot cancel past reservations', 400));
        }
        // Update reservation status to cancelled
        await database_1.default.query("UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [id]);
        // Update table status to available
        await database_1.default.query("UPDATE tables SET status = 'available' WHERE id = ?", [reservation.table_id]);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.cancelReservation = cancelReservation;
const getUserReservations = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.query;
        let query = 'SELECT * FROM reservations WHERE user_id = ?';
        const queryParams = [userId];
        if (status) {
            query += ' AND status = ?';
            queryParams.push(status);
        }
        query += ' ORDER BY reservation_time DESC';
        const [reservations] = await database_1.default.query(query, queryParams);
        res.status(200).json({
            status: 'success',
            results: Array.isArray(reservations) ? reservations.length : 0,
            data: {
                reservations,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserReservations = getUserReservations;
const updateReservationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validate status
        const validStatuses = ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'];
        if (!validStatuses.includes(status)) {
            return next(new error_middleware_1.AppError('Invalid status', 400));
        }
        // Check if reservation exists
        const [reservations] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [id]);
        if (!Array.isArray(reservations) || reservations.length === 0) {
            return next(new error_middleware_1.AppError('No reservation found with that ID', 404));
        }
        const reservation = reservations[0];
        // Update reservation status
        await database_1.default.query('UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        // Update table status if needed
        if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
            await database_1.default.query("UPDATE tables SET status = 'available' WHERE id = ?", [reservation.table_id]);
        }
        else if (status === 'seated') {
            await database_1.default.query("UPDATE tables SET status = 'occupied' WHERE id = ?", [reservation.table_id]);
        }
        // Get the updated reservation
        const [updatedReservations] = await database_1.default.query('SELECT * FROM reservations WHERE id = ?', [id]);
        res.status(200).json({
            status: 'success',
            data: {
                reservation: Array.isArray(updatedReservations) ? updatedReservations[0] : updatedReservations,
            },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateReservationStatus = updateReservationStatus;
//# sourceMappingURL=reservation.controller.js.map