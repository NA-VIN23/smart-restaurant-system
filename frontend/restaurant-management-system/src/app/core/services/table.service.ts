import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private apiUrl = `${environment.apiUrl}/tables`;

  constructor(private http: HttpClient) {}

  getAllTables(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAvailableTables(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available`, { params });
  }

  createTable(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateTable(id: number, payload: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteTable(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
