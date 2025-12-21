// manager-dashboard.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../services/api';
import { TableDialogComponent } from '../table-dialog/table-dialog';
import { RestaurantTable } from '../../models/types';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2>Manager Dashboard</h2>
        <button mat-raised-button color="primary" (click)="openTableDialog()">
          <mat-icon>add</mat-icon> Add Table
        </button>
      </div>

      <mat-tab-group>
        <!-- Tables Tab -->
        <mat-tab label="Tables">
          <table mat-table [dataSource]="tables" class="mat-elevation-z8">
             <!-- Table Number Column -->
            <ng-container matColumnDef="table_number">
            <th mat-header-cell *matHeaderCellDef> No. </th>
            <td mat-cell *matCellDef="let table"> {{table.table_number}} </td>
            </ng-container>

            <!-- Capacity Column -->
            <ng-container matColumnDef="capacity">
            <th mat-header-cell *matHeaderCellDef> Capacity </th>
            <td mat-cell *matCellDef="let table"> {{table.capacity}} </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef> Type </th>
            <td mat-cell *matCellDef="let table"> {{table.type}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef> Status </th>
            <td mat-cell *matCellDef="let table"> {{table.status}} </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let table">
                <button mat-icon-button color="primary" (click)="openTableDialog(table)">
                <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteTable(table)">
                <mat-icon>delete</mat-icon>
                </button>
            </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-tab>

        <!-- Queue Tab -->
        <mat-tab label="Queue">
             <div *ngIf="queue.length === 0" class="no-data">No one in queue.</div>
             <table *ngIf="queue.length > 0" mat-table [dataSource]="queue" class="mat-elevation-z8">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> Name </th>
                <td mat-cell *matCellDef="let entry"> {{entry.name}} </td>
                </ng-container>

                <!-- Party Size Column -->
                <ng-container matColumnDef="party_size">
                <th mat-header-cell *matHeaderCellDef> Party Size </th>
                <td mat-cell *matCellDef="let entry"> {{entry.party_size}} </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let entry">
                    <button mat-stroked-button color="primary" (click)="seatCustomer(entry)">
                    <mat-icon>check</mat-icon> Seat
                    </button>
                    <button mat-icon-button color="warn" (click)="removeQueueEntry(entry)">
                    <mat-icon>close</mat-icon>
                    </button>
                </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="queueColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: queueColumns;"></tr>
             </table>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    table { width: 100%; margin-top: 20px; }
    .no-data { padding: 20px; text-align: center; color: #666; font-style: italic; }
  `]
})
export class ManagerDashboard implements OnInit {
  tables: RestaurantTable[] = [];
  queue: any[] = [];
  displayedColumns: string[] = ['table_number', 'capacity', 'type', 'status', 'actions'];
  queueColumns: string[] = ['name', 'party_size', 'actions'];

  constructor(private api: ApiService, private dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadTables();
    this.loadQueue();
    // Poll every 5 seconds for updates
    setInterval(() => this.loadQueue(), 5000);
  }

  loadTables() {
    this.api.getTables().subscribe(data => {
      this.tables = data;
      this.cdr.detectChanges();
    });
  }

  loadQueue() {
    this.api.getQueue().subscribe(data => {
      this.queue = data;
      this.cdr.detectChanges();
    });
  }

  openTableDialog(table?: RestaurantTable) {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      width: '400px',
      data: table ? { ...table } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (table) {
          // Update
          this.api.updateTable(table.id, result).subscribe(() => this.loadTables());
        } else {
          // Add
          this.api.addTable(result).subscribe(() => this.loadTables());
        }
      }
    });
  }

  deleteTable(table: RestaurantTable) {
    if (confirm(`Are you sure you want to delete Table ${table.table_number}?`)) {
      this.api.deleteTable(table.id).subscribe(() => this.loadTables());
    }
  }

  seatCustomer(entry: any) {
    // In a real app, we would open a dialog to select a table.
    // For now, simpler: Just mark as 'seated' (removed from queue).
    if (confirm(`Mark ${entry.name} as Seated?`)) {
      this.api.updateQueueStatus(entry.id, 'seated').subscribe(() => this.loadQueue());
    }
  }

  removeQueueEntry(entry: any) {
    if (confirm(`Remove ${entry.name} from queue?`)) {
      this.api.updateQueueStatus(entry.id, 'cancelled').subscribe(() => this.loadQueue());
    }
  }
}
