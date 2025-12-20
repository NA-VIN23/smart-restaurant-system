import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  private apiUrl = `${environment.apiUrl}/queue`;

  constructor(private http: HttpClient) {}

  joinQueue(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  getQueue(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getQueuePosition(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/position/${userId}`);
  }

  leaveQueue(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  updateQueueStatus(id: number, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload);
  }
}
