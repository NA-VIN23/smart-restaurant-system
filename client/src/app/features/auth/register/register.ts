import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
})
export class Register {
  protected name = '';
  protected email = '';
  protected password = '';
  protected role: 'Customer' | 'Manager' = 'Customer';

  constructor(private auth: AuthService, private router: Router, private notify: NotificationService) {}

  submit() {
    this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        this.notify.success('Registered and logged in');
        this.router.navigate(['/tables']);
      },
      error: (err: any) => this.notify.error(err?.message || 'Registration failed')
    });
  }
  }
