import { User } from './user.model';

export interface QueueEntry {
  id: number;
  user_id: number;
  party_size: number;
  status: 'WAITING' | 'SEATED' | 'CANCELLED';
  position: number;
  estimated_wait_time?: number; // in minutes
  created_at: Date;
  updated_at: Date;
  user?: User;
}

export interface QueueInput {
  user_id: number;
  party_size: number;
  status?: 'WAITING' | 'SEATED' | 'CANCELLED';
  position?: number;
  estimated_wait_time?: number;
}

export interface QueueUpdateInput {
  status?: 'WAITING' | 'SEATED' | 'CANCELLED';
  position?: number;
  estimated_wait_time?: number;
}

export interface QueueStats {
  total_waiting: number;
  estimated_wait_time: number;
  position?: number;
}
