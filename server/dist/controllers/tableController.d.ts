import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllTables: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getAvailableTables: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTableById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createTable: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTable: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteTable: (req: AuthRequest, res: Response) => Promise<void>;
export declare const vacateTable: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=tableController.d.ts.map