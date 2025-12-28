
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-queue-status',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  template: `
    <div class="container">
      <mat-card class="status-card">
        <mat-card-header>
          <mat-card-title>Waitlist Status</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" class="loading">
             <mat-progress-bar mode="indeterminate"></mat-progress-bar>
             <p>Updating status...</p>
          </div>

          <div *ngIf="!loading && !inQueue" class="not-in-queue">
            <mat-icon>sentiment_dissatisfied</mat-icon>
            <h3>You are not in the queue.</h3>
            <button mat-raised-button color="primary" (click)="goToTables()">Join Queue</button>
          </div>

          <div *ngIf="!loading && inQueue" class="in-queue">
            <div class="position-badge">
              <span class="label">Your Position</span>
              <span class="value">#{{position}}</span>
            </div>
            
            <div class="info-row">
              <mat-icon>timer</mat-icon>
              <span>Estimated Wait: <strong>{{estimatedWaitTime}} mins</strong></span>
            </div>
            
            <p class="refresh-note">Status updates automatically.</p>
            
            <button mat-stroked-button color="warn" (click)="leaveQueue()">Leave Queue</button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { display: flex; justify-content: center; padding: 40px; }
    .status-card { width: 100%; max-width: 400px; text-align: center; }
    .not-in-queue mat-icon { font-size: 48px; height: 48px; width: 48px; color: grey; margin-bottom: 10px; }
    .info-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px 0; font-size: 1.1em; }
    .position-badge { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .position-badge .label { display: block; font-size: 0.9em; color: #1565c0; }
    .position-badge .value { display: block; font-size: 3em; font-weight: bold; color: #1565c0; }
    .refresh-note { font-size: 0.8em; color: #666; font-style: italic; margin-bottom: 20px; }
  `]
})
export class QueueStatusComponent implements OnInit {
  loading = true;
  inQueue = false;
  position = 0;
  estimatedWaitTime = 0;
  myEntryId: number | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.refreshStatus();
    setInterval(() => this.refreshStatus(), 5000); // Poll every 5s
  }

  refreshStatus() {
    const userId = this.auth.getUserId();
    const guestQueueId = localStorage.getItem('guestQueueId');

    if (!userId && !guestQueueId) {
      this.loading = false;
      return;
    }

    this.api.getQueue().subscribe({
      next: (queue) => {
        this.loading = false;

        console.log('Checking Queue Status...');
        console.log('User ID:', userId, 'Type:', typeof userId);
        console.log('Guest ID:', guestQueueId);
        console.log('Queue Data JSON:', JSON.stringify(queue));

        let index = -1;
        if (userId) {
          // Loose equality check in case of string vs number mismatch
          index = queue.findIndex(q => q.user_id == userId);
          console.log('Found Index by User ID:', index);
        }

        // Fallback to guest ID if not found by user ID (or if guest)
        if (index === -1 && guestQueueId) {
          index = queue.findIndex(q => q.id == guestQueueId);
          console.log('Found Index by Guest ID:', index);
        }

        if (index !== -1) {
          this.inQueue = true;
          this.position = index + 1;
          this.estimatedWaitTime = this.position * 15; // Rough estimate: 15 mins per table
          this.myEntryId = queue[index].id;
        } else {
          this.inQueue = false;
        }
        this.cdr.detectChanges(); // Fix loading flicker error
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  leaveQueue() {
    if (this.myEntryId && confirm('Are you sure you want to leave the queue?')) {
      this.api.updateQueueStatus(this.myEntryId, 'cancelled').subscribe(() => {
        localStorage.removeItem('guestQueueId');
        this.refreshStatus();
      });
    }
  }

  goToTables() {
    this.router.navigate(['/tables']);
  }
}