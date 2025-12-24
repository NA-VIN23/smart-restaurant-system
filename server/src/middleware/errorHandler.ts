import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/helpers';

/**
 * Custom AppError class used for controlled errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler for Express
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err);

  // Custom operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.stack));
    return;
  }

  // MySQL errors
  if ((err as any).code) {
    switch ((err as any).code) {
      case 'ER_DUP_ENTRY':
        res.status(409).json(errorResponse('Duplicate entry. Record already exists'));
        return;

      case 'ER_NO_REFERENCED_ROW':
      case 'ER_NO_REFERENCED_ROW_2':
        res.status(400).json(errorResponse('Referenced record does not exist'));
        return;

      case 'ER_BAD_FIELD_ERROR':
        res.status(400).json(errorResponse('Invalid field in query'));
        return;

      default:
        res.status(500).json(errorResponse('Database error occurred', (err as any).code));
        return;
    }
  }

  // Fallback
  res.status(500).json(errorResponse('Internal server error', err.message));
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(errorResponse(`Route ${req.originalUrl} not found`));
};

/**
 * Async handler wrapper for controller functions
 * Prevents try/catch repetition
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * IMPORTANT FIX:
 * Ensures TypeScript treats this file as a module,
 * preventing TS2306 ("is not a module") errors.
 */
export {};
