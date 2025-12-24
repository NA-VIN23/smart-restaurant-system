"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.comparePassword = exports.hashPassword = exports.validatePassword = exports.validateEmail = exports.isFutureDate = exports.calculateEstimatedWaitTime = exports.errorResponse = exports.successResponse = void 0;
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const successResponse = (message, data) => ({ success: true, message, data });
exports.successResponse = successResponse;
const errorResponse = (message, details) => ({ success: false, message, details });
exports.errorResponse = errorResponse;
const calculateEstimatedWaitTime = (position) => {
    // Simple heuristic: 5 minutes per position
    const minutes = Math.max(0, Math.floor(position) * 5);
    return minutes;
};
exports.calculateEstimatedWaitTime = calculateEstimatedWaitTime;
const isFutureDate = (date) => {
    return date.getTime() > Date.now();
};
exports.isFutureDate = isFutureDate;
const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    if (!password || password.length < 6)
        return { valid: false, message: 'Password must be at least 6 characters' };
    return { valid: true };
};
exports.validatePassword = validatePassword;
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
exports.comparePassword = comparePassword;
const generateToken = (payload, expiresIn = '7d') => {
    const secret = (process.env.JWT_SECRET || 'dev_secret');
    // use any cast to avoid tight jwt typings in this utility
    return jwt.sign(payload, secret, { expiresIn });
};
exports.generateToken = generateToken;
exports.default = {};
//# sourceMappingURL=helpers.js.map