import { Pool, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';

declare module 'mysql2/promise' {
  interface QueryResult {
    [key: string]: any;
  }

  interface QueryOptions {
    sql: string;
    values?: any | any[] | { [param: string]: any };
  }

  interface Pool {
    execute<T extends RowDataPacket[] | ResultSetHeader>(
      sql: string,
      values?: any | any[] | { [param: string]: any },
      callback?: (err: Error | null, result: T, fields: FieldPacket[]) => any
    ): Promise<[T, FieldPacket[]]>;

    query<T extends RowDataPacket[] | ResultSetHeader>(
      sql: string | QueryOptions,
      values?: any | any[] | { [param: string]: any }
    ): Promise<[T, FieldPacket[]]>;
  }
}

// Table interfaces
export interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'manager' | 'admin';
  contact_number?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Table extends RowDataPacket {
  id: number;
  table_number: number;
  capacity: number;
  type: 'regular' | 'vip';
  status: 'available' | 'occupied' | 'reserved';
  created_at: Date;
  updated_at?: Date;
}

export interface Reservation extends RowDataPacket {
  id: number;
  user_id: number;
  table_id: number;
  reservation_time: Date;
  party_size: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  special_requests?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface Queue extends RowDataPacket {
  id: number;
  user_id: number;
  party_size: number;
  status: 'waiting' | 'seated' | 'cancelled' | 'no-show';
  queue_position: number;
  estimated_wait_time: number | null;
  contact_number?: string;
  created_at: Date;
  updated_at?: Date;
}
