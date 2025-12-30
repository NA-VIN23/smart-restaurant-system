import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <nav class="navbar">
      <div class="container">
        <a routerLink="/" class="logo">
          Smarz
        </a>
        
        <div class="spacer"></div>
        
        <div class="nav-links">
          <button *ngIf="authService.getUserRole() !== 'Manager'" mat-button (click)="checkQueue()" class="nav-link">
             <mat-icon>queue</mat-icon> Your Queue
          </button>
          
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a mat-button routerLink="/login" class="nav-link">Login</a>
            <a mat-raised-button color="primary" routerLink="/register" class="cta-btn">Register</a>
          </ng-container>

          <ng-container *ngIf="authService.isLoggedIn()">
            <span class="welcome-text" *ngIf="false">Welcome</span>
            <button mat-button color="warn" (click)="logout()">
              <mat-icon>logout</mat-icon> Logout
            </button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      height: 70px;
      display: flex;
      align-items: center;
    }
    
    .container {
      width: 90%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color, #4f46e5);
      text-decoration: none;
      letter-spacing: -0.5px;
    }

    .spacer {
      flex: 1;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-link {
      font-weight: 500;
      color: var(--text-main, #1e293b);
    }

    .cta-btn {
      border-radius: 8px;
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  checkQueue() {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Please verify details/login to view your queue.', 'Login', { duration: 3000 })
        .onAction().subscribe(() => {
          this.router.navigate(['/login']);
        });
    } else {
      this.router.navigate(['/queue']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
