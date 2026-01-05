
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <div class="auth-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onRegister()">
             <mat-form-field appearance="fill" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput [(ngModel)]="name" name="name" required>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="email" name="email" required>
            </mat-form-field>
            
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select [(ngModel)]="role" name="role" required>
                <mat-option value="Customer">Customer</mat-option>
                <mat-option value="Manager">Manager</mat-option>
              </mat-select>
            </mat-form-field>

            <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

            <button mat-raised-button color="primary" type="submit" [disabled]="!email || !password || !name">Register</button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a routerLink="/login">Already have an account? Login</a>
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
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = 'Customer';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: (res: any) => {
        // Auto login or redirect to login
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
