import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  form: any;

  error: string | null = null;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer']
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { name, email, password, role } = this.form.value;
    this.auth.signup(name!, email!, password!, role!).subscribe({
      next: async () => {
        await this.auth.loadCurrentUser();
        this.snack.open('Signup successful', 'Close', { duration: 3000 });
        this.router.navigate(['/tables']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Signup failed';
        this.error = msg;
        this.snack.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
