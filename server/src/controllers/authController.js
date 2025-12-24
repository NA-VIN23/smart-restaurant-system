"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
var _dbModule = require('../config/database');
var pool = (_dbModule && _dbModule.default) ? _dbModule.default : _dbModule;
var types_1 = require("../types");
var helpers_1 = require("../utils/helpers");
var register = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, email, password, role, contact_info, passwordValidation, existingUsers, hashedPassword, result, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, email = _a.email, password = _a.password, role = _a.role, contact_info = _a.contact_info;
                // Validation
                if (!name || !email || !password || !role) {
                    res.status(400).json((0, helpers_1.errorResponse)('Name, email, password, and role are required'));
                    return [2 /*return*/];
                }
                if (!(0, helpers_1.validateEmail)(email)) {
                    res.status(400).json((0, helpers_1.errorResponse)('Invalid email format'));
                    return [2 /*return*/];
                }
                passwordValidation = (0, helpers_1.validatePassword)(password);
                if (!passwordValidation.valid) {
                    res.status(400).json((0, helpers_1.errorResponse)(passwordValidation.message));
                    return [2 /*return*/];
                }
                if (!Object.values(types_1.UserRole).includes(role)) {
                    res.status(400).json((0, helpers_1.errorResponse)('Invalid role. Must be Customer, Manager, or Admin'));
                    return [2 /*return*/];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                return [4 /*yield*/, pool.query('SELECT id FROM users WHERE email = ?', [email])];
            case 2:
                existingUsers = (_b.sent())[0];
                if (existingUsers.length > 0) {
                    res.status(409).json((0, helpers_1.errorResponse)('User with this email already exists'));
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, helpers_1.hashPassword)(password)];
            case 3:
                hashedPassword = _b.sent();
                return [4 /*yield*/, pool.query('INSERT INTO users (name, email, password, role, contact_info) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, role, contact_info || null])];
            case 4:
                result = (_b.sent())[0];
                token = (0, helpers_1.generateToken)({ id: result.insertId, email: email, role: role });
                res.status(201).json((0, helpers_1.successResponse)('User registered successfully', {
                    user: {
                        id: result.insertId,
                        name: name,
                        email: email,
                        role: role,
                        contact_info: contact_info
                    },
                    token: token
                }));
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                console.error('Registration error:', error_1);
                res.status(500).json((0, helpers_1.errorResponse)('Failed to register user', error_1.message));
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.register = register;
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, users, user, isPasswordValid, token, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                // Validation
                if (!email || !password) {
                    res.status(400).json((0, helpers_1.errorResponse)('Email and password are required'));
                    return [2 /*return*/];
                }
                if (!(0, helpers_1.validateEmail)(email)) {
                    res.status(400).json((0, helpers_1.errorResponse)('Invalid email format'));
                    return [2 /*return*/];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, pool.query('SELECT * FROM users WHERE email = ?', [email])];
            case 2:
                users = (_b.sent())[0];
                if (users.length === 0) {
                    res.status(401).json((0, helpers_1.errorResponse)('Invalid email or password'));
                    return [2 /*return*/];
                }
                user = users[0];
                return [4 /*yield*/, (0, helpers_1.comparePassword)(password, user.password)];
            case 3:
                isPasswordValid = _b.sent();
                if (!isPasswordValid) {
                    res.status(401).json((0, helpers_1.errorResponse)('Invalid email or password'));
                    return [2 /*return*/];
                }
                token = (0, helpers_1.generateToken)({ id: user.id, email: user.email, role: user.role });
                res.status(200).json((0, helpers_1.successResponse)('Login successful', {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        contact_info: user.contact_info
                    },
                    token: token
                }));
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.error('Login error:', error_2);
                res.status(500).json((0, helpers_1.errorResponse)('Failed to login', error_2.message));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var getProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userId, users, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.user;
                if (!user || !user.id) {
                    res.status(401).json((0, helpers_1.errorResponse)('Unauthorized'));
                    return [2 /*return*/];
                }
                userId = user.id;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, pool.query('SELECT id, name, email, role, contact_info, created_at FROM users WHERE id = ?', [userId])];
            case 2:
                users = (_a.sent())[0];
                if (users.length === 0) {
                    res.status(404).json((0, helpers_1.errorResponse)('User not found'));
                    return [2 /*return*/];
                }
                res.status(200).json((0, helpers_1.successResponse)('Profile retrieved successfully', users[0]));
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error('Get profile error:', error_3);
                res.status(500).json((0, helpers_1.errorResponse)('Failed to retrieve profile', error_3.message));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getProfile = getProfile;
