import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface QueueEntry {
  id: number;
  user_id: number;
  position: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class QueueService {
  constructor(private api: ApiService) {}

  join(payload: any) {
    return this.api.post<QueueEntry>('queue', payload);
  }

  position(userId: number) {
    return this.api.get<{ position: number }>(`queue/position/${userId}`);
  }

  list() {
    return this.api.get<QueueEntry[]>('queue');
  }

  seat(tableId: number) {
    return this.api.post('queue/seat', { table_id: tableId });
  }
}
