// api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RestaurantTable } from '../models/types'; // Importing your Contract

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    // Backend API base (matches server mount at /api/v1)
    // Ensure this uses the backend port set in DEV environment (5000 by default here)
    private apiUrl = 'http://localhost:5000/api/v1'; // Your Node Backend

    constructor(private http: HttpClient) { }

    // 1. Get All Tables
    getTables(): Observable<RestaurantTable[]> {
        return this.http.get<any>(`${this.apiUrl}/tables`, { withCredentials: true }).pipe(
            map((res) => res?.data?.tables || [])
        );
    }
    createTable(payload: any) {
        return this.http.post(`${this.apiUrl}/tables`, payload, { withCredentials: true });
    }

<<<<<<< HEAD
    updateTable(id: number, payload: any) {
        return this.http.patch(`${this.apiUrl}/tables/${id}`, payload, { withCredentials: true });
    }

    deleteTable(id: number) {
        return this.http.delete(`${this.apiUrl}/tables/${id}`, { withCredentials: true });
    }

    // 2. Join Queue
=======
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
>>>>>>> origin/main
    joinQueue(userId: number, partySize: number) {
        return this.http.post(`${this.apiUrl}/queue`, { user_id: userId, party_size: partySize }, { withCredentials: true });
    }

    getQueue() {
        return this.http.get<any>(`${this.apiUrl}/queue`, { withCredentials: true }).pipe(map(res => res?.data?.queue || []));
    }

    getQueuePosition(userId: number) {
        return this.http.get<any>(`${this.apiUrl}/queue/position/${userId}`, { withCredentials: true }).pipe(map(res => res?.data || null));
    }

    leaveQueue(id: number) {
        return this.http.delete(`${this.apiUrl}/queue/${id}`, { withCredentials: true });
    }

    updateQueueStatus(id: number, status: string, tableId?: number) {
        return this.http.patch(`${this.apiUrl}/queue/${id}`, { status, tableId }, { withCredentials: true });
    }

    // Reservations
    createReservation(payload: any) {
        return this.http.post(`${this.apiUrl}/reservations`, payload, { withCredentials: true });
    }

    getUserReservations(userId: number) {
        return this.http.get<any>(`${this.apiUrl}/reservations/user/${userId}`, { withCredentials: true }).pipe(map(res => res?.data?.reservations || []));
    }

    cancelReservation(id: number) {
        return this.http.delete(`${this.apiUrl}/reservations/${id}`, { withCredentials: true });
    }

    getAvailableTables(date: string, time: string, partySize: number) {
        return this.http.get<any>(`${this.apiUrl}/tables/available?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&partySize=${partySize}`, { withCredentials: true }).pipe(map(res => res?.data?.tables || []));
    }
}