import { Request, Response, NextFunction } from 'express';
/**
 * Custom AppError class used for controlled errors
 */
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
/**
 * Global error handler for Express
 */
export declare const errorHandler: (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => void;
/**
 * 404 handler for unknown routes
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * Async handler wrapper for controller functions
 * Prevents try/catch repetition
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * IMPORTANT FIX:
 * Ensures TypeScript treats this file as a module,
 * preventing TS2306 ("is not a module") errors.
 */
export {};
//# sourceMappingURL=errorHandler.d.ts.map