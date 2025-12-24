export declare const successResponse: (message: string, data?: any) => {
    success: boolean;
    message: string;
    data: any;
};
export declare const errorResponse: (message: string, details?: any) => {
    success: boolean;
    message: string;
    details: any;
};
export declare const calculateEstimatedWaitTime: (position: number) => number;
export declare const isFutureDate: (date: Date) => boolean;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => {
    valid: boolean;
    message: string;
} | {
    valid: boolean;
    message?: undefined;
};
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateToken: (payload: object, expiresIn?: string | number) => any;
declare const _default: {};
export default _default;
//# sourceMappingURL=helpers.d.ts.map