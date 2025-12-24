import type { Request, Response, NextFunction } from 'express';
export declare const validate: (validations: any[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const createTableValidator: import("express-validator").ValidationChain[];
export declare const updateTableValidator: import("express-validator").ValidationChain[];
export declare const joinQueueValidator: import("express-validator").ValidationChain[];
export declare const createReservationValidator: import("express-validator").ValidationChain[];
export declare const registerValidator: import("express-validator").ValidationChain[];
export declare const loginValidator: import("express-validator").ValidationChain[];
declare const _default: {};
export default _default;
//# sourceMappingURL=validators.d.ts.map