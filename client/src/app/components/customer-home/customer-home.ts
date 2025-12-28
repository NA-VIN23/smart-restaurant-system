
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JoinQueueDialogComponent } from '../join-queue-dialog/join-queue-dialog';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <header class="welcome-header">
        <h1>Welcome, Customer!</h1>
        <p>Please choose an option to proceed:</p>
      </header>

      <div class="action-grid">
        <!-- Option 1: View Tables -->
        <mat-card class="action-card" (click)="navigateTo('/tables')">
          <mat-card-header>
            <mat-card-title>View Tables</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-icon class="feature-icon">table_restaurant</mat-icon>
            <p>Check table availability</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary">View</button>
          </mat-card-actions>
        </mat-card>

        <!-- Option 2: Join Queue -->
        <mat-card class="action-card" (click)="openJoinQueue()">
          <mat-card-header>
            <mat-card-title>Join Queue</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-icon class="feature-icon">people</mat-icon>
            <p>Join waitlist & track position</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent">Join</button>
          </mat-card-actions>
        </mat-card>

        <!-- Option 3: Make Reservation -->
        <mat-card class="action-card" (click)="navigateTo('/reservation')">
          <mat-card-header>
            <mat-card-title>Make Reservation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-icon class="feature-icon">event</mat-icon>
            <p>Book a table in advance</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="warn">Reserve</button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <div class="logout-section">
        <button mat-stroked-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 40px; text-align: center; background: #f5f5f5; min-height: 80vh; }
    .welcome-header h1 { font-size: 2.5em; color: #333; margin-bottom: 10px; }
    .welcome-header p { color: #666; font-size: 1.2em; margin-bottom: 40px; }
    
    .action-grid { 
      display: flex; 
      justify-content: center; 
      gap: 30px; 
      flex-wrap: wrap; 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    
    .action-card { 
      width: 300px; 
      cursor: pointer; 
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }
    .action-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
    
    .feature-icon { font-size: 64px; height: 64px; width: 64px; margin: 20px 0; color: #555; }
    
    mat-card-header { margin-bottom: 10px; }
    mat-card-content { text-align: center; display: flex; flex-direction: column; align-items: center; flex-grow: 1; }
    mat-card-actions { margin-top: auto; padding-bottom: 10px; }

    /* Custom Colors for Cards if desired */
    /* .action-card:nth-child(1) .feature-icon { color: #3f51b5; } */
    /* .action-card:nth-child(2) .feature-icon { color: #ff4081; } */
    /* .action-card:nth-child(3) .feature-icon { color: #f44336; } */
    
    .logout-section { margin-top: 50px; }
  `]
})
export class CustomerHomeComponent {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  openJoinQueue() {
    const dialogRef = this.dialog.open(JoinQueueDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const userId = this.auth.getUserId();
        const queueData = { ...result, userId: userId || null };
        console.log('Sending Join Queue Request:', queueData);

        this.api.joinQueue(queueData).subscribe({
          next: (res: any) => {
            console.log('Join Queue Response:', res);
            if (res.id) {
              localStorage.setItem('guestQueueId', res.id.toString());
              console.log('Set guestQueueId:', res.id);
            }
            this.snackBar.open('You have joined the waitlist!', 'Close', { duration: 3000 });
            this.router.navigate(['/queue']); // Redirect to Status Page
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error joining queue. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
