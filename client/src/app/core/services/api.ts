import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string) {
    return this.http.get<T>(`${this.base}/${path}`).pipe(catchError(this.handleError));
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.base}/${path}`, body).pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: any) {
    return this.http.put<T>(`${this.base}/${path}`, body).pipe(catchError(this.handleError));
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.base}/${path}`).pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    const msg = err.error?.message || err.message || 'Server error';
    return throwError(() => new Error(msg));
  }
}
