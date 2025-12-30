
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-join-queue-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Join Waitlist</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="data.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Party Size</mat-label>
          <input matInput type="number" [(ngModel)]="data.partySize" name="partySize" required min="1" max="15">
          <mat-error *ngIf="data.partySize > 15">Max party size is 15</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Type</mat-label>
          <mat-select [(ngModel)]="data.customerType" name="customerType">
            <mat-option value="Regular">Regular</mat-option>
            <mat-option value="VIP">VIP</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data" [disabled]="!data.name || !data.partySize || data.partySize > 15">Join</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 20px; }
  `]
})
export class JoinQueueDialogComponent {
  data = { name: '', partySize: 1, customerType: 'Regular' };

  constructor(public dialogRef: MatDialogRef<JoinQueueDialogComponent>) { }
}
