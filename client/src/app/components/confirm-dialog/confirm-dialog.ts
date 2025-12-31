
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
    <div class="confirm-container">
      <div class="icon-wrapper">
        <mat-icon>warning</mat-icon>
      </div>
      <h2 mat-dialog-title>{{data.title}}</h2>
      <mat-dialog-content>
        <p class="message">{{data.message}}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-button [mat-dialog-close]="false">{{data.cancelText || 'Cancel'}}</button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true">{{data.confirmText || 'Yes, Leave'}}</button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirm-container {
      text-align: center;
      padding: 20px;
    }
    .icon-wrapper {
        color: #ff9800;
        margin-bottom: 0px;
        animation: shake 0.5s ease-in-out;
    }
    .icon-wrapper mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
    }
    h2 {
        margin: 10px 0 0 0;
        color: #333;
        font-weight: 700;
        font-size: 22px;
    }
    .message {
        font-size: 16px;
        color: #666;
        margin: 10px 0 20px 0;
        line-height: 1.5;
    }
    mat-dialog-actions {
        margin-top: 20px;
        gap: 10px;
    }
    button {
        padding: 0 24px;
        height: 40px;
        font-size: 15px;
        border-radius: 20px;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `]
})
export class ConfirmDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) { }
}
