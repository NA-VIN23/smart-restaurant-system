
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="auth-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onLogin()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="email" name="email" required>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

            <button mat-raised-button color="primary" type="submit" [disabled]="!email || !password">Login</button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a routerLink="/register">Don't have an account? Register</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; height: 80vh; }
    mat-card { width: 400px; padding: 20px; }
    .full-width { width: 100%; margin-bottom: 15px; }
    .error { color: red; margin-bottom: 10px; }
    mat-card-actions { justify-content: center; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res: any) => {
        if (res.user?.role === 'Manager') {
          this.router.navigate(['/manager']);
        } else {
          this.router.navigate(['/tables']);
        }
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });
  }
}
