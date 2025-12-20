<<<<<<< HEAD
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Backend API (note `/api/v1` prefix used by the server)
  // Backend port is usually defined by `process.env.PORT` (dev often 5000)
  private apiUrl = 'http://localhost:5000/api/v1/auth';
  private _currentUser = new BehaviorSubject<User | null>(null);

  public currentUser$ = this._currentUser.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, { withCredentials: true });
  }

  signup(name: string, email: string, password: string, role: string) {
    return this.http.post(`${this.apiUrl}/signup`, { name, email, password, role }, { withCredentials: true });
  }

  logout() {
    // Call server to clear cookie and clear client-side state
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this._currentUser.next(null),
      error: () => this._currentUser.next(null),
    });
  }

  async loadCurrentUser(): Promise<User | null> {
    try {
      const res = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }));
      const user = res?.data?.user ?? null;
      this._currentUser.next(user);
      return user;
    } catch (e) {
      this._currentUser.next(null);
      return null;
    }
  }
=======

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
/**
 * Service to handle Authentication
 */
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';

    constructor(private http: HttpClient) { }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
            tap((res: any) => {
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUserRole(): string {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || '';
    }
>>>>>>> origin/main
}
