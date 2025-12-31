// manager-dashboard.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../../services/api';
import { TableDialogComponent } from '../table-dialog/table-dialog';
import { SelectTableDialogComponent } from '../select-table-dialog/select-table-dialog';
import { QueueManagementComponent } from '../queue-management/queue-management';
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
    MatTabsModule,
    MatMenuModule,
    QueueManagementComponent
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
                <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="openTableDialog(table)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                    </button>
                    <button mat-menu-item (click)="deleteTable(table)">
                        <mat-icon color="warn">delete</mat-icon>
                        <span>Delete</span>
                    </button>
                </mat-menu>
            </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-tab>

        <!-- Queue Tab -->
        <mat-tab label="Queue">
             <app-queue-management (customerSeated)="loadTables()"></app-queue-management>
        </mat-tab>

        <!-- Reservations Tab -->
        <mat-tab label="Reservations">
          
          <div class="tab-actions">
              <button mat-flat-button color="warn" (click)="clearApproved()">
                  <mat-icon>delete_sweep</mat-icon> Reset / Clear Approved
              </button>
          </div>

          <table mat-table [dataSource]="reservations" class="mat-elevation-z8">
             <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef> Name </th>
              <td mat-cell *matCellDef="let res"> {{res.name}} </td>
            </ng-container>

            <!-- Size Column -->
            <ng-container matColumnDef="party_size">
              <th mat-header-cell *matHeaderCellDef> Size </th>
              <td mat-cell *matCellDef="let res"> {{res.party_size}} </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef> Type </th>
              <td mat-cell *matCellDef="let res"> {{res.customer_type}} </td>
            </ng-container>
            
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date </th>
              <td mat-cell *matCellDef="let res"> {{res.reservation_date | date}} </td>
            </ng-container>

            <!-- Time Column -->
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef> Time </th>
              <td mat-cell *matCellDef="let res"> {{res.reservation_time}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let res"> 
                <span [style.color]="getStatusColor(res.status)">{{res.status}}</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let res">
                <button mat-icon-button color="primary" *ngIf="res.status === 'Pending'" (click)="updateStatus(res, 'Approved')" title="Approve">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn" *ngIf="res.status === 'Pending'" (click)="updateStatus(res, 'Declined')" title="Decline">
                  <mat-icon>cancel</mat-icon>
                </button>
                <button mat-icon-button color="warn" *ngIf="res.status === 'Declined' || res.status === 'Cancelled'" (click)="deleteReservation(res)" title="Delete Reservation" style="margin-left: 5px;">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="reservationColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: reservationColumns;" [ngClass]="{'inactive-row': row.status === 'Declined' || row.status === 'Cancelled'}"></tr>
          </table>

          <div *ngIf="reservations.length === 0" class="no-data">
            No reservations found.
          </div>

        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; }
    .tab-actions { margin-top: 20px; display: flex; justify-content: flex-end; gap: 15px; }
    table { width: 100%; margin-top: 10px; }
    .no-data { padding: 20px; text-align: center; color: var(--text-muted); font-style: italic; }
    
    .inactive-row { background-color: var(--bg-color); color: var(--text-muted); }
    .inactive-row td { color: var(--text-muted) !important; }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  tables: RestaurantTable[] = [];
  displayedColumns: string[] = ['table_number', 'capacity', 'type', 'status', 'actions'];

  constructor(private api: ApiService, private dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadTables();
    this.loadReservations();
  }

  loadTables() {
    this.api.getTables().subscribe(data => {
      this.tables = data;
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

  // --- RESERVATIONS ---
  reservations: any[] = [];
  reservationColumns: string[] = ['name', 'party_size', 'type', 'date', 'time', 'status', 'actions'];

  loadReservations() {
    this.api.getReservations().subscribe(data => {
      this.reservations = data;
      this.cdr.detectChanges();
    });
  }

  updateStatus(reservation: any, status: string) {
    this.api.updateReservationStatus(reservation.id, status).subscribe(() => {
      this.loadReservations();
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved': return 'green';
      case 'Declined': return 'red';
      default: return 'orange';
    }
  }

  clearApproved() {
    if (confirm('Are you sure? This will delete all APPROVED reservations to reset testing data.')) {
      this.api.clearApprovedReservations().subscribe({
        next: () => {
          this.loadReservations();
          // alert('Cleared approved reservations.');
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteReservation(res: any) {
    if (confirm(`Are you sure you want to permanently delete the reservation for ${res.name}?`)) {
      this.api.deleteReservationByManager(res.id).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (err) => console.error(err)
      });
    }
  }
}
