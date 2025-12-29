import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <mat-card class="login-card">
      <h2>Login</h2>
      <form (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="email" name="email" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input matInput [(ngModel)]="password" name="password" type="password" required />
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit">Login</button>
      </form>
    </mat-card>
  `,
  styles: [`.login-card{max-width:400px;margin:24px auto;padding:16px}.full{width:100%}`]
})
export class Login {
  protected email = '';
  protected password = '';

  constructor(private auth: AuthService, private router: Router, private notify: NotificationService) {}

  submit() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.notify.success('Logged in');
        this.router.navigate(['/tables']);
      },
      error: (err: any) => this.notify.error(err?.message || 'Login failed')
    });
  }
}
// Note: Removed duplicated auto-generated component block. The standalone component above is the implementation.
