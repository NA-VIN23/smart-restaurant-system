
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-seated-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="seated-container">
      <div class="icon-wrapper">
        <mat-icon>check_circle</mat-icon>
      </div>
      <h2 mat-dialog-title>You have been seated!</h2>
      <mat-dialog-content>
        <p class="table-text">Please proceed to:</p>
        <div class="table-number">Table {{data.tableNumber}}</div>
        <p class="message">{{data.message}}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-raised-button color="primary" [mat-dialog-close]="true">Great!</button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .seated-container {
      text-align: center;
      padding: 20px;
    }
    .icon-wrapper {
        color: #4caf50;
        margin-bottom: 10px;
    }
    .icon-wrapper mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
    }
    h2 {
        margin: 0;
        color: #333;
        font-weight: 700;
        font-size: 24px;
    }
    .table-text {
        font-size: 16px;
        color: #666;
        margin-top: 20px;
    }
    .table-number {
        font-size: 48px;
        font-weight: 800;
        color: #4f46e5;
        margin: 10px 0;
    }
    .message {
        color: #888;
        font-style: italic;
    }
    mat-dialog-actions {
        margin-top: 30px;
    }
    button {
        padding: 0 40px;
        height: 48px;
        font-size: 18px;
        border-radius: 24px;
    }
  `]
})
export class SeatedDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { tableNumber: string, message: string }) { }
}
