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
    joinQueue(data: { userId?: number, name?: string, partySize: number, customerType?: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/queue/join`, {
            user_id: data.userId,
            name: data.name,
            party_size: data.partySize,
            customer_type: data.customerType
        });
    }

    // 6. Get Queue
    getQueue(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/queue`);
    }

    // 7. Update Queue Status
    updateQueueStatus(id: number, status: 'seated' | 'cancelled', tableId?: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/queue/${id}/status`, { status, table_id: tableId });
    }

    // 8. Helper: Get Active Queue Count for User/Guest
    getActiveQueueCount(userId: number | null, guestIds: number[]): Observable<number> {
        return new Observable(observer => {
            if (!userId && guestIds.length === 0) {
                observer.next(0);
                observer.complete();
                return;
            }
            // Dedup guest IDs
            const uniqueGuestIds = [...new Set(guestIds)];
            this.getQueue().subscribe({
                next: (queue) => {
                    let count = 0;
                    queue.forEach(q => {
                        const isUserMatch = userId && q.user_id == userId;
                        const isGuestMatch = guestIds.includes(q.id);
                        if (isUserMatch || isGuestMatch) count++;
                    });
                    observer.next(count);
                    observer.complete();
                },
                error: (err) => observer.error(err)
            });
        });
    }

    // 9. Get My Queue Status (For Notifications)
    getMyQueueStatus(ids: number[]): Observable<any[]> {
        if (ids.length === 0) return new Observable(obs => obs.next([]));
        return this.http.get<any[]>(`${this.apiUrl}/queue/my-status?query_ids=${ids.join(',')}`);
    }
}