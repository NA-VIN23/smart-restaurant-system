"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
const helpers_1 = require("../utils/helpers");
const register = async (req, res) => {
    const { name, email, password, role, contact_info } = req.body;
    // Validation
    if (!name || !email || !password || !role) {
        res.status(400).json((0, helpers_1.errorResponse)('Name, email, password, and role are required'));
        return;
    }
    if (!(0, helpers_1.validateEmail)(email)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid email format'));
        return;
    }
    const passwordValidation = (0, helpers_1.validatePassword)(password);
    if (!passwordValidation.valid) {
        res.status(400).json((0, helpers_1.errorResponse)(passwordValidation.message));
        return;
    }
    if (!Object.values(types_1.UserRole).includes(role)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid role. Must be Customer, Manager, or Admin'));
        return;
    }
    try {
        // Check if user already exists
        const [existingUsers] = await database_1.default.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            res.status(409).json((0, helpers_1.errorResponse)('User with this email already exists'));
            return;
        }
        // Hash password
        const hashedPassword = await (0, helpers_1.hashPassword)(password);
        // Insert user
        const [result] = await database_1.default.query('INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, role, contact_info || null]);
        // Generate token
        const token = (0, helpers_1.generateToken)({ id: result.insertId, email, role });
        res.status(201).json((0, helpers_1.successResponse)('User registered successfully', {
            user: {
                id: result.insertId,
                name,
                email,
                role,
                contact_info
            },
            token
        }));
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to register user', error.message));
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
        res.status(400).json((0, helpers_1.errorResponse)('Email and password are required'));
        return;
    }
    if (!(0, helpers_1.validateEmail)(email)) {
        res.status(400).json((0, helpers_1.errorResponse)('Invalid email format'));
        return;
    }
    try {
        // Get user
        const [users] = await database_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            res.status(401).json((0, helpers_1.errorResponse)('Invalid email or password'));
            return;
        }
        const user = users[0];
        // Verify password
        const isPasswordValid = await (0, helpers_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json((0, helpers_1.errorResponse)('Invalid email or password'));
            return;
        }
        // Generate token
        const token = (0, helpers_1.generateToken)({ id: user.id, email: user.email, role: user.role });
        res.status(200).json((0, helpers_1.successResponse)('Login successful', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                contact_info: user.contact_info
            },
            token
        }));
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to login', error.message));
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    const user = req.user;
    if (!user || !user.id) {
        res.status(401).json((0, helpers_1.errorResponse)('Unauthorized'));
        return;
    }
    const userId = user.id;
    try {
        const [users] = await database_1.default.query('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            res.status(404).json((0, helpers_1.errorResponse)('User not found'));
            return;
        }
        res.status(200).json((0, helpers_1.successResponse)('Profile retrieved successfully', users[0]));
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve profile', error.message));
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map