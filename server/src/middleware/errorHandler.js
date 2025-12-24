"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const helpers_1 = require('../utils/helpers');
/**
 * Custom AppError class used for controlled errors
 */
class AppError extends Error {
	constructor(message, statusCode = 500, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		Error.captureStackTrace(this, this.constructor);
	}
}
exports.AppError = AppError;
/**
 * Global error handler for Express
 */
const errorHandler = (err, _req, res, _next) => {
	console.error('❌ Error:', err);
	// Custom operational error
	if (err instanceof AppError) {
		res.status(err.statusCode).json((0, helpers_1.errorResponse)(err.message, err.stack));
		return;
	}
	// MySQL errors
	if (err && err.code) {
		switch (err.code) {
			case 'ER_DUP_ENTRY':
				res.status(409).json((0, helpers_1.errorResponse)('Duplicate entry. Record already exists'));
				return;
			case 'ER_NO_REFERENCED_ROW':
			case 'ER_NO_REFERENCED_ROW_2':
				res.status(400).json((0, helpers_1.errorResponse)('Referenced record does not exist'));
				return;
			case 'ER_BAD_FIELD_ERROR':
				res.status(400).json((0, helpers_1.errorResponse)('Invalid field in query'));
				return;
			default:
				res.status(500).json((0, helpers_1.errorResponse)('Database error occurred', err.code));
				return;
		}
	}
	// Fallback
	res.status(500).json((0, helpers_1.errorResponse)('Internal server error', err && err.message));
};
exports.errorHandler = errorHandler;
/**
 * 404 handler for unknown routes
 */
const notFoundHandler = (req, res) => {
	res.status(404).json((0, helpers_1.errorResponse)(`Route ${req.originalUrl} not found`));
};
exports.notFoundHandler = notFoundHandler;
/**
 * Async handler wrapper for controller functions
 * Prevents try/catch repetition
 */
const asyncHandler = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
exports.asyncHandler = asyncHandler;

// Ensure module resolution compatibility
module.exports = Object.assign(module.exports, { AppError, errorHandler, notFoundHandler, asyncHandler });

