import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const joinQueue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getQueueStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllQueueEntries: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const leaveQueue: (req: AuthRequest, res: Response) => Promise<void>;
export declare const seatCustomer: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=queueController.d.ts.map