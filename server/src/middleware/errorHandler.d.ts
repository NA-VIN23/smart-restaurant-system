import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;
	constructor(message: string, statusCode?: number, isOperational?: boolean);
}

export const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
export const notFoundHandler: (req: Request, res: Response) => void;
export const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map
//# sourceMappingURL=errorHandler.d.ts.map