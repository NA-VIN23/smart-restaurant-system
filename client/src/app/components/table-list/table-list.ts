
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { JoinQueueDialogComponent } from '../join-queue-dialog/join-queue-dialog';
import { SuccessDialogComponent } from '../success-dialog/success-dialog';
import { RestaurantTable } from '../../models/types';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h2>Available Tables</h2>
        <button mat-raised-button color="accent" (click)="openJoinQueueDialog()">
          <mat-icon>hourglass_empty</mat-icon> Join Waitlist
        </button>
      </div>

      <div class="grid">
        <mat-card *ngFor="let table of tables" [class.available]="table.status === 'Available'">
          <mat-card-header>
            <mat-card-title>Table {{table.table_number}}</mat-card-title>
            <mat-card-subtitle>{{table.type}} • {{table.capacity}} Seats</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="status" [ngClass]="table.status.toLowerCase()">{{table.status}}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .grid { display: flex; flex-wrap: wrap; gap: 20px; }
    mat-card { width: 200px; background-color: var(--bg-card); color: var(--text-main); }
    .status { font-weight: bold; text-align: center; margin-top: 10px; }
    .available { color: green; }
    .occupied { color: red; }
    .reserved { color: orange; }
    mat-card.available { border-left: 5px solid green; }
  `]
})
export class TableListComponent implements OnInit {
  tables: RestaurantTable[] = [];

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.api.getTables().subscribe(data => {
      // Sort priority: Available (0), Reserved (1), Occupied (2)  anything else (3)
      const priority: { [key: string]: number } = {
        'Available': 0,
        'Reserved': 1,
        'Occupied': 2
      };

      this.tables = data.sort((a, b) => {
        const pA = priority[a.status] ?? 99;
        const pB = priority[b.status] ?? 99;
        return pA - pB;
      });

      this.cdr.detectChanges();
    });
  }

  openJoinQueueDialog() {
    const userId = this.auth.getUserId();
    const rawGuest = sessionStorage.getItem('guestQueueId');
    let guestIds = [];
    try { guestIds = rawGuest ? (rawGuest.startsWith('[') ? JSON.parse(rawGuest) : [parseInt(rawGuest)]) : []; } catch (e) { }

    this.api.getActiveQueueCount(userId, guestIds).subscribe(count => {
      if (count >= 2) {
        this.snackBar.open('You have reached the maximum limit of 2 active queues.', 'Close', { duration: 3000 });
        return;
      }

      const dialogRef = this.dialog.open(JoinQueueDialogComponent, {
        width: '300px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const queueData = { ...result, userId: userId || null };

          this.api.joinQueue(queueData).subscribe({
            next: (res: any) => {
              if (res.id) {
                // logic to append guest id
                const current = sessionStorage.getItem('guestQueueId');
                let ids: number[] = [];
                if (current) {
                  if (current.startsWith('[')) {
                    try { ids = JSON.parse(current); } catch (e) { ids = []; }
                  } else {
                    ids = [parseInt(current)];
                  }
                }
                ids.push(res.id);
                sessionStorage.setItem('guestQueueId', JSON.stringify(ids));
              }
              this.dialog.open(SuccessDialogComponent, {
                width: '350px',
                data: {
                  title: 'Joined!',
                  message: 'Success! You have been added to the waitlist.',
                  buttonText: 'View Queue'
                }
              }).afterClosed().subscribe(() => {
                this.router.navigate(['/queue']);
              });
            },
            error: (err) => {
              console.error(err);
              this.snackBar.open('Error joining queue', 'Close', { duration: 3000 });
            }
          });
        }
      });
    });
  }
}