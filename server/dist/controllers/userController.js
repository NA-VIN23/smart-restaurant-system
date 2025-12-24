"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const types_1 = require("../types");
const getAllUsers = async (_req, res) => {
    try {
        const [users] = await database_1.default.query('SELECT id, name, email, role, contact_info, created_at FROM users ORDER BY id');
        res.status(200).json((0, helpers_1.successResponse)('Users retrieved successfully', users));
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve users', error.message));
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await database_1.default.query('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('User not found'));
            return;
        }
        res.status(200).json((0, helpers_1.successResponse)('User retrieved successfully', users[0]));
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve user', error.message));
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, contact_info, role } = req.body;
    if (role && !Object.values(types_1.UserRole).includes(role)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid role'));
        return;
    }
    try {
        const fields = [];
        const values = [];
        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (contact_info !== undefined) {
            fields.push('contact_info = ?');
            values.push(contact_info);
        }
        if (role !== undefined) {
            fields.push('role = ?');
            values.push(role);
        }
        if (fields.length === 0) {
            res.status(400).json((0, helpers_1.errorResponse)('No fields to update'));
            return;
        }
        values.push(id);
        const [result] = await database_1.default.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        if (result.affectedRows === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('User not found'));
            return;
        }
        const [updated] = await database_1.default.query('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [id]);
        res.status(200).json((0, helpers_1.successResponse)('User updated successfully', updated[0]));
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to update user', error.message));
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await database_1.default.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('User not found'));
            return;
        }
        res.status(200).json((0, helpers_1.successResponse)('User deleted successfully'));
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to delete user', error.message));
    }
};
exports.deleteUser = deleteUser;
exports.default = {};
//# sourceMappingURL=userController.js.map