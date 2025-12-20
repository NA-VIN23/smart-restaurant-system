export interface Table {
  id: number;
  table_number: string;
  capacity: number;
  type: 'REGULAR' | 'VIP';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  created_at: Date;
  updated_at: Date;
}

export interface TableInput {
  table_number: string;
  capacity: number;
  type: 'REGULAR' | 'VIP';
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export interface TableUpdateInput {
  capacity?: number;
  type?: 'REGULAR' | 'VIP';
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}
