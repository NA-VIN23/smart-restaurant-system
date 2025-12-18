// types.ts
export interface User {
    id: number;
    name: string;
    role: 'Customer' | 'Manager' | 'Admin';
    email: string;
}

export interface RestaurantTable {
    id: number;
    table_number: string;
    capacity: number;
    type: 'Regular' | 'VIP';
    status: 'Available' | 'Occupied' | 'Reserved';
    current_customer_id?: number | null;
    reservation_time?: string | null;
}