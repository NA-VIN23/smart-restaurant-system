// api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestaurantTable } from '../models/types'; // Importing your Contract

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:3000/api'; // Your Node Backend

    constructor(private http: HttpClient) { }

    // 1. Get All Tables
    getTables(): Observable<RestaurantTable[]> {
        return this.http.get<RestaurantTable[]>(`${this.apiUrl}/tables`);
    }

    // 2. Add Table
    addTable(table: Partial<RestaurantTable>): Observable<any> {
        return this.http.post(`${this.apiUrl}/tables`, table);
    }

    // 3. Update Table
    updateTable(id: number, table: Partial<RestaurantTable>): Observable<any> {
        return this.http.put(`${this.apiUrl}/tables/${id}`, table);
    }

    // 4. Delete Table
    deleteTable(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/tables/${id}`);
    }

    // 5. Join Queue (We will add this logic later)
    // 5. Join Queue
    joinQueue(data: { userId?: number, name?: string, partySize: number }): Observable<any> {
        return this.http.post(`${this.apiUrl}/queue/join`, data);
    }

    // 6. Get Queue
    getQueue(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/queue`);
    }

    // 7. Update Queue Status
    updateQueueStatus(id: number, status: 'seated' | 'cancelled'): Observable<any> {
        return this.http.put(`${this.apiUrl}/queue/${id}/status`, { status });
    }
}