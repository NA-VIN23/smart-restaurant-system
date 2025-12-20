import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(options: DialogOptions): Observable<boolean | { confirmed: boolean; input?: string }> {
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        ...options,
        isLoading: false
      }
    });

    return dialogRef.afterClosed();
  }

  alert(message: string, title: string = 'Alert'): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        title,
        message,
        confirmText: 'OK',
        showCancel: false
      }
    });

    return dialogRef.afterClosed();
  }

  prompt(
    message: string, 
    title: string = 'Input Required', 
    inputLabel: string = 'Enter value',
    inputPlaceholder: string = ''
  ): Observable<{ confirmed: boolean; input: string }> {
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        title,
        message,
        confirmText: 'Submit',
        cancelText: 'Cancel',
        showInput: true,
        inputLabel,
        inputPlaceholder
      }
    });

    return dialogRef.afterClosed();
  }
}
