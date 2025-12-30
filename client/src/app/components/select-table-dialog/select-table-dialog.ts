
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api';
import { RestaurantTable } from '../../models/types';

@Component({
  selector: 'app-select-table-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Select Table for {{data.customerName}}</h2>
    <mat-dialog-content>
      <div *ngIf="availableTables.length === 0" class="no-tables">
        <p>No available tables found.</p>
      </div>
      <mat-selection-list #tables [multiple]="false">
        <mat-list-option *ngFor="let table of availableTables" [value]="table" [disabled]="isDisabled(table)">
          <mat-icon matListItemIcon>table_restaurant</mat-icon>
          <div matListItemTitle>Table {{table.table_number}} ({{table.type}})</div>
          <div matListItemLine>
             Capacity: {{table.capacity}} 
             <span *ngIf="isDisabled(table)" style="color:red; font-size: 0.8em;">(Too small)</span>
          </div>
        </mat-list-option>
      </mat-selection-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="tables.selectedOptions.selected.length === 0"
              (click)="confirm(tables.selectedOptions.selected[0].value)">
        Seat Here
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .no-tables { padding: 20px; text-align: center; color: red; }
  `]
})
export class SelectTableDialogComponent implements OnInit {
  availableTables: RestaurantTable[] = [];

  constructor(
    public dialogRef: MatDialogRef<SelectTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customerName: string, partySize: number, customerType?: string },
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.api.getTables().subscribe(tables => {
      // Show all Available tables (case-insensitive check)
      let filtered = tables.filter(t => t.status && t.status.toLowerCase() === 'available');

      // VIP Logic: If customer is VIP, they can only sit at VIP tables
      if (this.data.customerType === 'VIP') {
        filtered = filtered.filter(t => t.type === 'VIP');
      } else {
        // Regular Logic: Regular customers cannot sit at VIP tables
        filtered = filtered.filter(t => t.type !== 'VIP');
      }

      this.availableTables = filtered;
      this.cdr.detectChanges();
    });
  }

  isDisabled(table: RestaurantTable): boolean {
    return Number(table.capacity) < Number(this.data.partySize);
  }

  confirm(table: RestaurantTable) {
    this.dialogRef.close(table);
  }
}
