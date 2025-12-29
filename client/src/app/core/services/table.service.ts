import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface TableModel {
  id: number;
  table_number: string;
  capacity: number;
  type: 'Regular' | 'VIP';
  status: 'Available' | 'Occupied' | 'Reserved';
}

@Injectable({ providedIn: 'root' })
export class TableService {
  constructor(private api: ApiService) {}

  list() {
    return this.api.get<TableModel[]>('tables');
  }

  create(payload: Partial<TableModel>) {
    return this.api.post<TableModel>('tables', payload);
  }

  update(id: number, payload: Partial<TableModel>) {
    return this.api.put<TableModel>(`tables/${id}`, payload);
  }

  remove(id: number) {
    return this.api.delete<void>(`tables/${id}`);
  }

  vacate(id: number) {
    return this.api.post<void>(`tables/${id}/vacate`, {});
  }
}
