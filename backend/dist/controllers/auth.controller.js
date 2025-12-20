"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const signToken = (id, role) => {
    const payload = { id, role };
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const options = {
        // cast to any to satisfy SignOptions typing for env var values
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h'),
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.role);
    const cookieOptions = {
        expires: new Date(Date.now() +
            (process.env.JWT_COOKIE_EXPIRES_IN
                ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
                : 24 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };
    res.cookie('jwt', token, cookieOptions);
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};
const signup = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        // 1) Check if user already exists
        const [existingUsers] = await database_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return next(new error_middleware_1.AppError('Email already in use!', 400));
        }
        // 2) Hash the password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // 3) Create new user
        const [result] = await database_1.default.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role || 'customer']);
        // 4) Get the newly created user
        const [newUser] = await database_1.default.query('SELECT * FROM users WHERE id = ?', [
            result.insertId,
        ]);
        // 5) Generate token and send response
        createSendToken(Array.isArray(newUser) ? newUser[0] : newUser, 201, res);
    }
    catch (err) {
        next(err);
    }
};
exports.signup = signup;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new error_middleware_1.AppError('Please provide email and password!', 400));
        }
        // 2) Check if user exists && password is correct
        const [users] = await database_1.default.query('SELECT * FROM users WHERE email = ?', [
            email,
        ]);
        if (!Array.isArray(users) || users.length === 0) {
            return next(new error_middleware_1.AppError('Incorrect email or password', 401));
        }
        const user = users[0];
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return next(new error_middleware_1.AppError('Incorrect email or password', 401));
        }
        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const protect = async (req, _res, next) => {
    try {
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }
        if (!token) {
            if (process.env.RUN_INTEGRATION === 'true')
                console.log('protect: no token found on request');
            return next(new error_middleware_1.AppError('You are not logged in! Please log in to get access.', 401));
        }
        // 2) Verification token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (process.env.RUN_INTEGRATION === 'true')
            console.log('protect: token decoded', decoded);
        // 3) Check if user still exists
        const [users] = await database_1.default.query('SELECT * FROM users WHERE id = ?', [
            decoded.id,
        ]);
        if (!Array.isArray(users) || users.length === 0) {
            return next(new error_middleware_1.AppError('The user belonging to this token no longer exists.', 401));
        }
        // 4) Check if user changed password after the token was issued
        // (This requires a passwordChangedAt field in the users table)
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = users[0];
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        // Ensure req.user exists and has role
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new error_middleware_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
//# sourceMappingURL=auth.controller.js.map