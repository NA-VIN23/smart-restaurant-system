import type { Request } from 'express';
export declare enum UserRole {
    CUSTOMER = "Customer",
    MANAGER = "Manager",
    ADMIN = "Admin"
}
export interface User {
    id: number;
    name?: string;
    email?: string;
    password?: string;
    role: UserRole | string;
    contact_info?: string;
}
export interface AuthRequest extends Request {
    user?: Partial<User> | null;
}
export type CreateTableRequest = {
    table_number: string;
    capacity: number;
    type?: 'Regular' | 'VIP';
};
export type UpdateTableRequest = Partial<CreateTableRequest> & {
    status?: 'Available' | 'Occupied' | 'Reserved';
};
export type LoginRequest = {
    email: string;
    password: string;
};
export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
    role: string;
    contact_info?: string;
};
export declare enum TableStatus {
    AVAILABLE = "Available",
    OCCUPIED = "Occupied",
    RESERVED = "Reserved"
}
export declare enum TableType {
    REGULAR = "Regular",
    VIP = "VIP"
}
export type JoinQueueRequest = {
    capacity_needed: number;
    type_preference?: 'Regular' | 'VIP';
};
export type ReservationRequest = {
    table_id: number;
    reservation_time: string;
    notes?: string;
};
//# sourceMappingURL=types.d.ts.map