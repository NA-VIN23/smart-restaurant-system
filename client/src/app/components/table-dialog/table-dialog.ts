
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RestaurantTable } from '../../models/types';

@Component({
  selector: 'app-table-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Table' : 'Add New Table' }}</h2>
    <mat-dialog-content>
      <form>
         <mat-form-field appearance="fill" class="full-width">
          <mat-label>Table Number</mat-label>
          <input matInput [(ngModel)]="table.table_number" name="table_number" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Capacity (Max 20)</mat-label>
          <input matInput type="number" [(ngModel)]="table.capacity" name="capacity" required min="1" max="20">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="table.type" name="type" required>
            <mat-option value="Regular">Regular</mat-option>
            <mat-option value="VIP">VIP</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="table.status" name="status" required>
            <mat-option value="Available">Available</mat-option>
            <mat-option value="Occupied">Occupied</mat-option>
            <mat-option value="Reserved">Reserved</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="table" [disabled]="!table.table_number || !table.capacity || (table.capacity && table.capacity > 20)">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 20px; }
  `]
})
export class TableDialogComponent {
  table: Partial<RestaurantTable> = { type: 'Regular', capacity: 4, status: 'Available' };

  constructor(
    public dialogRef: MatDialogRef<TableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.table = { ...data };
    }
  }
}
