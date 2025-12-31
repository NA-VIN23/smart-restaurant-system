import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { SuccessDialogComponent } from '../success-dialog/success-dialog';
import { ReservationDialogComponent } from './reservation-dialog';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      
      <div class="header">
        <h1>Your Reservations</h1>
        <button mat-raised-button color="primary" *ngIf="userReservations.length > 0 && !limitReached" (click)="openBookingDialog()">
          <mat-icon>add</mat-icon> Reserve Another Table
        </button>
      </div>

      <!-- Loading / Empty State -->
      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading && userReservations.length === 0" class="empty-state">
        <mat-icon class="empty-icon">event_busy</mat-icon>
        <h3>No reservations yet</h3>
        <p>Book a table now to secure your spot!</p>
        <button mat-raised-button color="primary" class="big-btn" (click)="openBookingDialog()">
          Reserve a Table
        </button>
        <button mat-button (click)="router.navigate(['/home'])" style="margin-top: 10px;">Back to Home</button>
      </div>

      <!-- List State -->
      <div *ngIf="!loading && userReservations.length > 0" class="list-view">
         
         <div *ngIf="limitReached" class="limit-warning">
            <mat-icon>info</mat-icon> You have reached the maximum of 2 active reservations.
         </div>

         <div *ngFor="let res of userReservations" class="status-card">
            <div class="status-header">
                <span class="date">{{res.reservation_date | date:'mediumDate'}} at {{res.reservation_time}}</span>
                <span class="badge" [ngClass]="res.status.toLowerCase()">{{res.status}}</span>
            </div>
            <div class="status-body">
                <p><strong>Party:</strong> {{res.party_size}} People ({{res.customer_type}})</p>
                <p><strong>Name:</strong> {{res.name}}</p>
                <p class="note" *ngIf="res.status === 'Pending'">Waiting for manager approval...</p>
                <p class="note success" *ngIf="res.status === 'Approved'">Confirmed! See you then.</p>
                <p class="note error" *ngIf="res.status === 'Declined'">Sorry, we couldn't accommodate this request.</p>
                <p class="note cancelled" *ngIf="res.status === 'Cancelled'">This reservation has been cancelled.</p>
                
                
                <div class="actions">
                   <button mat-button color="warn" *ngIf="res.status !== 'Cancelled' && res.status !== 'Declined' && isCancellable(res)" (click)="cancelReservation(res)">Cancel Reservation</button>
                   <button mat-stroked-button color="warn" *ngIf="res.status === 'Cancelled' || res.status === 'Declined'" (click)="deleteReservation(res)">Delete</button>
                </div>
            </div>
         </div>
         
         <div class="back-actions">
            <button mat-button (click)="router.navigate(['/home'])">Back to Home</button>
         </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      min-height: 80vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    h1 { margin: 0; color: var(--text-main); }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--bg-card);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }
    .big-btn {
      padding: 10px 30px;
      font-size: 1.1em;
    }

    .status-card {
      background: var(--bg-card);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s;
    }
    .status-card:hover { transform: translateY(-2px); }
    
    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .date { font-weight: bold; font-size: 1.2em; color: var(--text-main); }
    .badge { padding: 5px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; text-transform: uppercase; }
    .badge.pending { background: rgba(245, 124, 0, 0.15); color: #f57c00; }
    .badge.approved { background: rgba(46, 125, 50, 0.15); color: #2e7d32; }
    .badge.declined { background: rgba(198, 40, 40, 0.15); color: #c62828; }
    
    .status-body p { margin: 5px 0; color: var(--text-muted); }
    .note { font-style: italic; font-size: 0.95em; margin-top: 15px !important; display: block; }
    .note.success { color: #2e7d32; font-weight: 500; }
    .note.error { color: #c62828; }
    .note.cancelled { color: #757575; font-style: italic; }
    
    .badge.cancelled { background: rgba(117, 117, 117, 0.15); color: #616161; }
    
    .actions { margin-top: 15px; text-align: right; }
    
    .limit-warning { 
        background-color: rgba(239, 68, 68, 0.1); 
        color: #d32f2f; 
        padding: 15px; 
        border-radius: 8px; 
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .back-actions { text-align: center; margin-top: 30px; }
    .loading { text-align: center; margin-top: 50px; font-size: 1.2em; color: var(--text-muted); }
  `]
})
export class ReservationComponent implements OnInit, OnDestroy {
  userReservations: any[] = [];
  activeReservationsCount = 0;
  limitReached = false;
  loading = true;
  private pollingInterval: any;

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    public router: Router,
    private auth: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.refreshReservations();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.refreshReservations(true);
    }, 5000);
  }

  refreshReservations(isPolling = false) {
    if (this.auth.isLoggedIn()) {
      // If not polling, we might want to show loading state initially
      // but if polling, we definitely don't want to flicker "Loading..."

      this.api.getUserReservations().subscribe({
        next: (data) => {
          if (isPolling) {
            this.checkForStatusChanges(data);
          }

          this.userReservations = data;
          this.activeReservationsCount = data.length;
          this.limitReached = this.activeReservationsCount >= 2;
          this.loading = false;
          this.cdr.detectChanges(); // Ensure view updates
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  checkForStatusChanges(newData: any[]) {
    // console.log('Checking for status changes...', newData);
    newData.forEach(newRes => {
      const oldRes = this.userReservations.find(r => r.id === newRes.id);
      if (oldRes) {
        // console.log(`Comparing Res ID ${newRes.id}: Old Status=${oldRes.status}, New Status=${newRes.status}`);
        if (oldRes.status === 'Pending' && newRes.status === 'Approved') {
          console.log('Status changed to Approved! triggering dialog.');
          this.dialog.open(SuccessDialogComponent, {
            width: '400px',
            data: {
              title: 'Reservation Approved!',
              message: `Great news! Your table for ${newRes.party_size} people on ${newRes.reservation_date} is confirmed.`,
              buttonText: 'Awesome'
            }
          });
        } else if (oldRes.status === 'Pending' && newRes.status === 'Declined') {
          console.log('Status changed to Declined! triggering dialog.');
          this.dialog.open(SuccessDialogComponent, {
            width: '400px',
            data: {
              title: 'Reservation Declined',
              message: `We're sorry, but your reservation request for ${newRes.reservation_date} could not be accommodated.`,
              buttonText: 'Close'
            }
          });
        }
      }
    });
  }

  isCancellable(res: any): boolean {
    if (res.status === 'Cancelled' || res.status === 'Declined') return false;

    // NEW RULE: Pending reservations can be cancelled at any time by the user
    if (res.status === 'Pending') return true;

    // For Approved reservations, enforce the 24-hour rule
    if (!res.reservation_date || !res.reservation_time) return false;

    try {
      let dateStr = res.reservation_date;
      // If it's a Date object, convert to string YYYY-MM-DD
      if (res.reservation_date instanceof Date) {
        dateStr = res.reservation_date.toISOString().split('T')[0];
      } else if (typeof res.reservation_date === 'string') {
        // Handle "2025-12-31T00:00:00.000Z" or "2025-12-31"
        dateStr = res.reservation_date.split('T')[0];
      }

      const timeStr = res.reservation_time; // '1:00 PM' or '13:00'
      // Use space separator which allows Date() to parse "2023-01-01 1:00 PM" correctly
      const reservationDate = new Date(`${dateStr} ${timeStr}`);
      const now = new Date();

      if (isNaN(reservationDate.getTime())) {
        console.error('Invalid Date Parsed:', dateStr, timeStr);
        return false;
      }

      const diffInMs = reservationDate.getTime() - now.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);

      // Debug log (can be removed later)
      // console.log(`[Check Cancel] ${dateStr} ${timeStr} -> Diff: ${diffInHours}`);

      return diffInHours > 24;
    } catch (e) {
      console.error('Error parsing date for cancellation:', e);
      return false;
    }
  }

  cancelReservation(res: any) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    this.api.cancelReservation(res.id).subscribe({
      next: () => {
        this.snackBar.open('Reservation cancelled successfully.', 'Close', { duration: 3000 });
        this.refreshReservations();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err.error?.message || 'Failed to cancel reservation.', 'Close', { duration: 3000 });
      }
    });
  }

  deleteReservation(res: any) {
    if (!confirm('Are you sure you want to remove this reservation from your history?')) return;

    this.api.deleteUserReservation(res.id).subscribe({
      next: () => {
        this.snackBar.open('Reservation removed.', 'Close', { duration: 3000 });
        this.refreshReservations();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err.error?.message || 'Failed to remove reservation.', 'Close', { duration: 3000 });
      }
    });
  }

  openBookingDialog() {
    if (this.limitReached) {
      this.snackBar.open('Maximum reservation limit reached (2 active).', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true // Force user to use Cancel/Submit
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Reservation created
        this.refreshReservations(); // Refresh list immediately

        // Show follow-up success dialog OR rely on dashboard update.
        // User requested "Your reservation shows up" (Dashboard update is sufficient).
        // But let's verify if they want a success popup too. 
        // Previous code had SuccessPopup -> Then View Status.
        // New flow: Dialog closes -> Dashboard updates.
        // The Dialog itself shows a SnackBar "Reservation request sent!".
        // We can also show the SuccessDialog here for emphasis if desired, but sticking to simple flow first.
        this.dialog.open(SuccessDialogComponent, {
          width: '400px',
          data: {
            title: 'Request Sent',
            message: 'Your reservation has been placed successfully in the queue.',
            buttonText: 'OK'
          }
        });
      }
    });
  }
}
