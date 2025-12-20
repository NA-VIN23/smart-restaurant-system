export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'manager' | 'admin';
  created_at: Date;
  updated_at?: Date;
  password_changed_at?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  active?: boolean;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'manager' | 'admin';
}
