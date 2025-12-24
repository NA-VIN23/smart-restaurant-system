"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacateTable = exports.deleteTable = exports.updateTable = exports.createTable = exports.getTableById = exports.getAvailableTables = exports.getAllTables = void 0;
// Use require for the pool to avoid TS module resolution edge-cases in tests
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pool = require('../config/database').default;
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const getAllTables = async (_req, res) => {
    try {
        const [tables] = await pool.query('SELECT * FROM restaurant_tables ORDER BY table_number');
        res.status(200).json((0, helpers_1.successResponse)('Tables retrieved successfully', tables));
    }
    catch (error) {
        console.error('Get tables error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve tables', error.message));
    }
};
exports.getAllTables = getAllTables;
const getAvailableTables = async (req, res) => {
    const { capacity, type } = req.query;
    try {
        let query = 'SELECT * FROM restaurant_tables WHERE status = ?';
        const params = [types_1.TableStatus.AVAILABLE];
        if (capacity) {
            query += ' AND capacity >= ?';
            params.push(parseInt(capacity));
        }
        if (type && Object.values(types_1.TableType).includes(type)) {
            query += ' AND type = ?';
            params.push(type);
        }
        query += ' ORDER BY capacity, table_number';
        const [tables] = await pool.query(query, params);
        res.status(200).json((0, helpers_1.successResponse)('Available tables retrieved successfully', tables));
    }
    catch (error) {
        console.error('Get available tables error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve available tables', error.message));
    }
};
exports.getAvailableTables = getAvailableTables;
const getTableById = async (req, res) => {
    const { id } = req.params;
    try {
        const [tables] = await pool.query('SELECT * FROM restaurant_tables WHERE id = ?', [id]);
        if (tables.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Table not found'));
            return;
        }
        res.status(200).json((0, helpers_1.successResponse)('Table retrieved successfully', tables[0]));
    }
    catch (error) {
        console.error('Get table error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve table', error.message));
    }
};
exports.getTableById = getTableById;
const createTable = async (req, res) => {
    const { table_number, capacity, type } = req.body;
    // Validation
    if (!table_number || !capacity) {
        res.status(400).json((0, helpers_1.errorResponse)('Table number and capacity are required'));
        return;
    }
    if (capacity <= 0) {
        res.status(400).json((0, helpers_1.errorResponse)('Capacity must be greater than 0'));
        return;
    }
    if (type && !Object.values(types_1.TableType).includes(type)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid table type. Must be Regular or VIP'));
        return;
    }
    try {
        const [result] = await pool.query('INSERT INTO restaurant_tables (table_number, capacity, type) VALUES (?, ?, ?)', [table_number, capacity, type || types_1.TableType.REGULAR]);
        const [newTable] = await pool.query('SELECT * FROM restaurant_tables WHERE id = ?', [result.insertId]);
        res.status(201).json((0, helpers_1.successResponse)('Table created successfully', newTable[0]));
    }
    catch (error) {
        console.error('Create table error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json((0, helpers_1.errorResponse)('Table number already exists'));
            return;
        }
        res.status(500).json((0, helpers_1.errorResponse)('Failed to create table', error.message));
    }
};
exports.createTable = createTable;
const updateTable = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (Object.keys(updates).length === 0) {
        res.status(400).json((0, helpers_1.errorResponse)('No fields to update'));
        return;
    }
    // Validation
    if (updates.capacity !== undefined && updates.capacity <= 0) {
        res.status(400).json((0, helpers_1.errorResponse)('Capacity must be greater than 0'));
        return;
    }
    if (updates.type && !Object.values(types_1.TableType).includes(updates.type)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid table type'));
        return;
    }
    if (updates.status && !Object.values(types_1.TableStatus).includes(updates.status)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid table status'));
        return;
    }
    try {
        const fields = [];
        const values = [];
        Object.entries(updates).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(id);
        const [result] = await pool.query(`UPDATE restaurant_tables SET ${fields.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Table not found'));
            return;
        }
        const [updatedTable] = await pool.query('SELECT * FROM restaurant_tables WHERE id = ?', [id]);
        res.status(200).json((0, helpers_1.successResponse)('Table updated successfully', updatedTable[0]));
    }
    catch (error) {
        console.error('Update table error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json((0, helpers_1.errorResponse)('Table number already exists'));
            return;
        }
        res.status(500).json((0, helpers_1.errorResponse)('Failed to update table', error.message));
    }
};
exports.updateTable = updateTable;
const deleteTable = async (req, res) => {
    const { id } = req.params;
    try {
        const [tables] = await pool.query('SELECT status FROM restaurant_tables WHERE id = ?', [id]);
        if (tables.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Table not found'));
            return;
        }
        if (tables[0].status === types_1.TableStatus.OCCUPIED || tables[0].status === types_1.TableStatus.RESERVED) {
            res.status(400).json((0, helpers_1.errorResponse)('Cannot delete occupied or reserved table'));
            return;
        }
        // FIX: removed unused variable
        await pool.query('DELETE FROM restaurant_tables WHERE id = ?', [id]);
        res.status(200).json((0, helpers_1.successResponse)('Table deleted successfully'));
    }
    catch (error) {
        console.error('Delete table error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to delete table', error.message));
    }
};
exports.deleteTable = deleteTable;
const vacateTable = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query(`UPDATE restaurant_tables 
       SET status = ?, current_customer_id = NULL, current_customer_name = NULL, 
           reservation_time = NULL, queue_position = NULL, notes = NULL
       WHERE id = ?`, [types_1.TableStatus.AVAILABLE, id]);
        if (result.affectedRows === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('Table not found'));
            return;
        }
        res.status(200).json((0, helpers_1.successResponse)('Table vacated successfully'));
    }
    catch (error) {
        console.error('Vacate table error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to vacate table', error.message));
    }
};
exports.vacateTable = vacateTable;
//# sourceMappingURL=tableController.js.map