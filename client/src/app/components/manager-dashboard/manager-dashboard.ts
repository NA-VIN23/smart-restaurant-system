
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
    MatDialogModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2>Manager Dashboard</h2>
        <button mat-raised-button color="primary" (click)="openTableDialog()">
          <mat-icon>add</mat-icon> Add Table
        </button>
      </div>

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
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    table { width: 100%; }
  `]
})
export class ManagerDashboard implements OnInit {
  tables: RestaurantTable[] = [];
  displayedColumns: string[] = ['table_number', 'capacity', 'type', 'status', 'actions'];

  constructor(private api: ApiService, private dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadTables();
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
}
