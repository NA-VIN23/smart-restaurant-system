
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SeatedDialogComponent } from '../seated-dialog/seated-dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

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
      <div class="status-list">
        
        <h2 style="text-align: center; color: #333; margin-bottom: 20px;">Your Waitlist Status</h2>

        <div *ngIf="loading" class="loading">
             <mat-progress-bar mode="indeterminate"></mat-progress-bar>
             <p>Updating status...</p>
        </div>

        <div *ngIf="!loading && !inQueue" class="not-in-queue card">
            <mat-icon>sentiment_dissatisfied</mat-icon>
            <h3>You are not in the queue.</h3>
            <button mat-raised-button color="primary" (click)="goToTables()">Join Queue</button>
        </div>

        <ng-container *ngIf="!loading && inQueue">
            <mat-card *ngFor="let entry of myEntries" class="status-card">
                <mat-card-header>
                    <mat-card-title>Party of {{entry.party_size}}</mat-card-title>
                    <mat-card-subtitle>{{entry.name}} ({{entry.customer_type}})</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                    <div class="position-badge">
                        <span class="label">Your Position</span>
                        <span class="value">#{{entry.position}}</span>
                    </div>
                
                    <div class="info-row">
                        <mat-icon>timer</mat-icon>
                        <span>Estimated Wait: <strong>{{entry.estimatedWaitTime}} mins</strong></span>
                    </div>
                
                    <div class="info-row" *ngIf="entry.table_id">
                         <mat-icon>check_circle</mat-icon>
                         <span>Seated!</span>
                    </div>

                    <button mat-stroked-button color="warn" (click)="leaveQueue(entry.id)">Leave This Queue</button>
                </mat-card-content>
            </mat-card>
            
            <div style="text-align: center; margin-top: 20px;" *ngIf="myEntries.length < 2">
                <button mat-raised-button color="accent" (click)="goToTables()">Join Another Queue</button>
            </div>
        </ng-container>

      </div>
    </div>
  `,
  styles: [`
    .container { display: flex; justify-content: center; padding: 40px; }
    .status-list { width: 100%; max-width: 500px; }
    .status-card { margin-bottom: 20px; text-align: center; }
    .card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .not-in-queue mat-icon { font-size: 48px; height: 48px; width: 48px; color: grey; margin-bottom: 10px; }
    .info-row { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px 0; font-size: 1.1em; }
    .position-badge { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .position-badge .label { display: block; font-size: 0.9em; color: #1565c0; }
    .position-badge .value { display: block; font-size: 3em; font-weight: bold; color: #1565c0; }
  `]
})
export class QueueStatusComponent implements OnInit, OnDestroy {
  loading = true;
  inQueue = false;
  myEntries: any[] = []; // Array to store multiple queue entries
  private intervalId: any;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.refreshStatus();
    this.intervalId = setInterval(() => this.refreshStatus(), 5000); // Poll every 5s
  }

  refreshStatus() {
    const userId = this.auth.getUserId();
    // Support legacy single ID or new Array
    const rawGuest = sessionStorage.getItem('guestQueueId');
    let guestIds: number[] = [];

    if (rawGuest) {
      if (rawGuest.startsWith('[')) {
        try { guestIds = JSON.parse(rawGuest); } catch (e) { guestIds = []; }
      } else {
        guestIds = [parseInt(rawGuest, 10)];
      }
      guestIds = [...new Set(guestIds)]; // Deduplicate
    }

    if (!userId && guestIds.length === 0) {
      this.loading = false;
      return;
    }

    this.api.getQueue().subscribe({
      next: (queue) => {
        // ... existing logic ...

        // Also check for Seated Status separately
        if (guestIds.length > 0 || userId) {
          // Collect all IDs we care about. 
          // Note: userId might have multiple entries in DB, but we only track what's in 'myEntries' locally or we can query DB for all user's entries?
          // Let's stick to the IDs we found in 'queue' (waiting) + any we might have lost track of (seated)?
          // Better: use the list of 'guestIDs' from session + maybe userId-associated IDs?
          // Actually, if they disappear from 'queue' (waiting), we might miss them.
          // So we should query 'getMyQueueStatus' using the known guestIds + any IDs we were tracking.

          // Collect IDs to check.
          let idsToCheck = [...guestIds];
          if (this.myEntries.length > 0) {
            this.myEntries.forEach(e => {
              if (!idsToCheck.includes(e.id)) idsToCheck.push(e.id);
            });
          }

          if (idsToCheck.length > 0) {
            this.api.getMyQueueStatus(idsToCheck).subscribe(myRows => {
              myRows.forEach(row => {
                if (row.status === 'seated') {
                  this.dialog.open(SeatedDialogComponent, {
                    width: '400px',
                    data: {
                      tableNumber: row.table_number || 'Unknown',
                      message: 'Thank you for waiting!'
                    }
                  }).afterClosed().subscribe(() => {
                    this.removeEntryFromStorage(row.id);
                  });
                }
              });
            });
          }
        }

        this.loading = false;
        this.myEntries = [];
        // ... (rest of matching logic)


        // Find all matches with Priority Logic
        const matches: any[] = [];

        queue.forEach((q) => {
          const isUserMatch = userId && q.user_id == userId;
          const isGuestMatch = guestIds.includes(q.id);

          if (isUserMatch || isGuestMatch) {
            // Calculate Priority Position
            // Filter queue to only show people of the SAME type (VIP vs Regular)
            const typeQueue = queue.filter(item => item.customer_type === q.customer_type);
            const position = typeQueue.findIndex(item => item.id === q.id) + 1;

            matches.push({
              ...q,
              position: position,
              estimatedWaitTime: position * 15
            });
          }
        });

        if (matches.length > 0) {
          this.inQueue = true;
          this.myEntries = matches;
        } else {
          this.inQueue = false;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeEntryFromStorage(entryId: number) {
    const rawGuest = sessionStorage.getItem('guestQueueId');
    if (rawGuest) {
      let guestIds: number[] = [];
      if (rawGuest.startsWith('[')) {
        try { guestIds = JSON.parse(rawGuest); } catch (e) { }
        guestIds = guestIds.filter(id => id !== entryId);
        sessionStorage.setItem('guestQueueId', JSON.stringify(guestIds));
      } else {
        if (parseInt(rawGuest) == entryId) {
          sessionStorage.removeItem('guestQueueId');
        }
      }
    }
    this.refreshStatus();
  }

  leaveQueue(entryId: number) {
    this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Leave Queue',
        message: 'Are you sure you want to leave this queue? You will lose your spot.',
        confirmText: 'Yes, Leave',
        cancelText: 'Stay'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.api.updateQueueStatus(entryId, 'cancelled').subscribe(() => {
          this.removeEntryFromStorage(entryId);
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  goToTables() {
    this.router.navigate(['/tables']);
  }
}