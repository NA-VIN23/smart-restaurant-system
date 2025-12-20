import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Confirm Action' }}</h2>
    
    <mat-dialog-content>
      <p>{{ data.message || 'Are you sure you want to perform this action?' }}</p>
      
      <div class="form-group" *ngIf="data.showInput">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>{{ data.inputLabel || 'Reason' }}</mat-label>
          <input matInput [(ngModel)]="inputValue" [placeholder]="data.inputPlaceholder || ''">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onDismiss()" [disabled]="data.isLoading">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button 
        mat-button 
        [color]="data.confirmColor || 'warn'" 
        (click)="onConfirm()" 
        [disabled]="(data.showInput && !inputValue) || data.isLoading"
      >
        <span *ngIf="data.isLoading" class="spinner-border spinner-border-sm" role="status"></span>
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-dialog-actions {
      padding: 16px 24px;
      margin: 0 -24px -24px -24px;
      justify-content: flex-end;
    }
    
    .mat-dialog-content {
      padding: 16px 24px;
      margin: 0 -24px;
    }
    
    .form-group {
      margin-top: 16px;
    }
  `]
})
export class ConfirmationDialogComponent {
  inputValue: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title?: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      confirmColor?: 'primary' | 'accent' | 'warn';
      isLoading?: boolean;
      showInput?: boolean;
      inputLabel?: string;
      inputPlaceholder?: string;
    }
  ) {
    // Set default values
    this.data = {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      isLoading: false,
      showInput: false,
      ...data
    };
  }

  onConfirm(): void {
    if (this.data.showInput) {
      this.dialogRef.close({ confirmed: true, input: this.inputValue });
    } else {
      this.dialogRef.close(true);
    }
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}
