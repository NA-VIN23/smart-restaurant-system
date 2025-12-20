import { User } from './user.model';
import { Table } from './table.model';

export interface Reservation {
  id: number;
  user_id: number;
  table_id: number;
  reservation_time: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  guest_count: number;
  special_requests?: string;
  created_at: Date;
  updated_at: Date;
  user?: User;
  table?: Table;
}

export interface ReservationInput {
  user_id: number;
  table_id: number;
  reservation_time: Date | string;
  guest_count: number;
  special_requests?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface ReservationUpdateInput {
  table_id?: number;
  reservation_time?: Date | string;
  guest_count?: number;
  special_requests?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface ReservationQueryParams {
  date?: string;
  status?: string;
  user_id?: number;
  table_id?: number;
}
