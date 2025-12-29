import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface Reservation {
  id: number;
  table_id: number;
  user_id: number;
  reservation_time: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private api: ApiService) {}

  list() {
    return this.api.get<Reservation[]>('reservations');
  }

  create(payload: Partial<Reservation>) {
    return this.api.post<Reservation>('reservations', payload);
  }

  cancel(id: number) {
    return this.api.put<Reservation>(`reservations/${id}/cancel`, {});
  }
}
