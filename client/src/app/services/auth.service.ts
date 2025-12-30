
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
                    sessionStorage.setItem('token', res.token);
                    sessionStorage.setItem('user', JSON.stringify(res.user));
                }
            })
        );
    }

    logout() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    }

    isLoggedIn(): boolean {
        return !!sessionStorage.getItem('token');
    }

    getUserRole(): string {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        return user.role || '';
    }

    getUserId(): number | null {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        return user.id || null;
    }
}
