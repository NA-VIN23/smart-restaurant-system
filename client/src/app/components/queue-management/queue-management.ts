import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { SelectTableDialogComponent } from '../select-table-dialog/select-table-dialog';

@Component({
  selector: 'app-queue-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './queue-management.html',
  styleUrl: './queue-management.css',
})
export class QueueManagementComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'party_size', 'customer_type', 'status', 'actions'];
  queue: any[] = [];
  intervalId: any;
  lastUpdated: Date = new Date(); // New property

  @Output() customerSeated = new EventEmitter<void>();

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.refreshQueue();
    // Poll every 5 seconds
    this.intervalId = setInterval(() => this.refreshQueue(), 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  refreshQueue() {
    this.api.getQueue().subscribe({
      next: (data) => {
        this.queue = data;
        this.lastUpdated = new Date(); // Update timestamp
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching queue:', err);
        // Do not snackbar repeatedly on poll fail, just log
      }
    });
  }

  seatCustomer(entry: any) {
    const dialogRef = this.dialog.open(SelectTableDialogComponent, {
      width: '400px',
      data: {
        customerName: entry.name,
        partySize: entry.party_size,
        customerType: entry.customer_type // Pass type
      }
    });

    dialogRef.afterClosed().subscribe(table => {
      if (table) {
        this.api.updateQueueStatus(entry.id, 'seated', table.id).subscribe({
          next: () => {
            this.snackBar.open(`Seated ${entry.name} at Table ${table.table_number}`, 'Ok', { duration: 3000 });
            this.refreshQueue();
            this.customerSeated.emit();
          },
          error: (err) => {
            console.error('Error updating queue status:', err);
            this.snackBar.open('Failed to seat customer', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  removeQueueEntry(entry: any) {
    if (confirm(`Remove ${entry.name} from queue?`)) {
      this.api.updateQueueStatus(entry.id, 'cancelled').subscribe({
        next: () => {
          this.snackBar.open(`Removed ${entry.name} from queue`, 'Ok', { duration: 3000 });
          this.refreshQueue();
        },
        error: (err) => {
          console.error('Error removing from queue:', err);
          this.snackBar.open('Failed to remove customer', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
