
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SuccessDialogData {
    title: string;
    message: string;
    buttonText: string;
}

@Component({
    selector: 'app-success-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="success-container">
      <div class="icon-wrapper">
        <mat-icon>check_circle</mat-icon>
      </div>
      <h2 mat-dialog-title>{{data.title}}</h2>
      <mat-dialog-content>
        <p class="message">{{data.message}}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-raised-button color="primary" [mat-dialog-close]="true">{{data.buttonText}}</button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .success-container {
      text-align: center;
      padding: 20px;
    }
    .icon-wrapper {
        color: #4caf50;
        margin-bottom: 0px;
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .icon-wrapper mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
    }
    h2 {
        margin: 10px 0 0 0;
        color: #333;
        font-weight: 700;
        font-size: 24px;
    }
    .message {
        font-size: 16px;
        color: #666;
        margin: 10px 0 20px 0;
        line-height: 1.5;
    }
    mat-dialog-actions {
        margin-top: 20px;
    }
    button {
        padding: 0 30px;
        height: 44px;
        font-size: 16px;
        border-radius: 22px;
        width: 100%;
    }
    @keyframes popIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class SuccessDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: SuccessDialogData) { }
}
