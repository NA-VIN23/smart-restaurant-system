import { Injectable, signal } from '@angular/core';
import { ApiService } from './api';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  role: 'Customer' | 'Manager' | 'Admin';
  contact_info?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);

  get user() {
    return this._user();
  }

  constructor(private api: ApiService) {}

  loadProfile() {
    return this.api.get<any>('auth/profile').pipe(
      tap((res) => {
        const data = (res as any).data || res;
        if (data) this._user.set(data);
      })
    );
  }

  login(credentials: { email: string; password: string }) {
    // Expect server to return { token, user }
    return this.api.post<any>('auth/login', credentials).pipe(
      tap((res) => {
        const data = (res as any).data || res;
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) this._user.set(data.user);
        else if (data.token) {
          // fetch profile if server returned only token
          this.loadProfile().subscribe({ error: () => { /* ignore */ } });
        }
      })
    );
  }

  register(payload: any) {
    return this.api.post<any>('auth/register', payload).pipe(
      tap((res) => {
        const data = (res as any).data || res;
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) this._user.set(data.user);
        else if (data.token) {
          this.loadProfile().subscribe({ error: () => { /* ignore */ } });
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._user.set(null);
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string) {
    return this.user?.role === role;
  }
}

