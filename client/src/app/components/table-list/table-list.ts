
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../services/api';
import { JoinQueueDialogComponent } from '../join-queue-dialog/join-queue-dialog';
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
    MatDialogModule
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
    mat-card { width: 200px; }
    .status { font-weight: bold; text-align: center; margin-top: 10px; }
    .available { color: green; }
    .occupied { color: red; }
    .reserved { color: orange; }
    mat-card.available { border-left: 5px solid green; }
  `]
})
export class TableListComponent implements OnInit {
  tables: RestaurantTable[] = [];

  constructor(private api: ApiService, private dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.api.getTables().subscribe(data => {
      this.tables = data;
      this.cdr.detectChanges();
    });
  }

  openJoinQueueDialog() {
    const dialogRef = this.dialog.open(JoinQueueDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.joinQueue(result).subscribe(
          () => alert('Joined queue successfully!'),
          err => alert('Error joining queue')
        );
      }
    });
  }
}