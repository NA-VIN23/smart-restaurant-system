import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createReservation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyReservations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllReservations: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const updateReservation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelReservation: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=reservationController.d.ts.map