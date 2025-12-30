import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-reservation-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Reserve a Table</h2>
    <mat-dialog-content>
      <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()">
        
        <!-- Name -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Your Name">
          <mat-error *ngIf="reservationForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <!-- Party Size -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Party Size</mat-label>
          <input matInput type="number" formControlName="party_size" min="1" max="20">
          <mat-error *ngIf="reservationForm.get('party_size')?.hasError('required')">Party size is required</mat-error>
          <mat-error *ngIf="reservationForm.get('party_size')?.hasError('min')">Minimum 1 person</mat-error>
          <mat-error *ngIf="reservationForm.get('party_size')?.hasError('max')">Maximum 20 people</mat-error>
        </mat-form-field>

        <!-- Type -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Type</mat-label>
          <mat-select formControlName="customer_type">
            <mat-option value="Regular">Regular</mat-option>
            <mat-option value="VIP">VIP</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Date -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="reservation_date" [min]="minDate" [max]="maxDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="reservationForm.get('reservation_date')?.hasError('required')">Date is required</mat-error>
        </mat-form-field>

        <!-- Time -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Time</mat-label>
          <mat-select formControlName="reservation_time">
            <mat-option *ngFor="let time of availableTimes" [value]="time">{{time}}</mat-option>
          </mat-select>
          <mat-error *ngIf="reservationForm.get('reservation_time')?.hasError('required')">Time is required</mat-error>
        </mat-form-field>

        <div class="actions">
            <button mat-button type="button" (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="reservationForm.invalid">
            Confirm Booking
            </button>
        </div>

      </form>
    </mat-dialog-content>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 10px; }
    form { padding-top: 8px; } /* Prevent label clipping */
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  `]
})
export class ReservationDialogComponent {
  reservationForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  availableTimes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReservationDialogComponent>
  ) {
    // Current Date without time for correct comparison
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);

    this.maxDate = new Date();
    this.maxDate.setDate(this.minDate.getDate() + 14);
    this.maxDate.setHours(23, 59, 59, 999);

    this.reservationForm = this.fb.group({
      name: ['', Validators.required],
      party_size: [2, [Validators.required, Validators.min(1), Validators.max(20)]],
      customer_type: ['Regular', Validators.required],
      reservation_date: [null, Validators.required],
      reservation_time: ['', Validators.required]
    });

    this.generateTimeSlots();
  }

  generateTimeSlots() {
    const times = [];
    for (let i = 10; i <= 22; i++) {
      const hour = i > 12 ? i - 12 : i;
      const ampm = i >= 12 ? 'PM' : 'AM';
      times.push(`${hour}:00 ${ampm}`);
      times.push(`${hour}:30 ${ampm}`);
    }
    this.availableTimes = times;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      const userId = this.auth.getUserId();

      const payload = {
        ...formValue,
        user_id: userId,
        reservation_date: this.formatDate(formValue.reservation_date)
      };

      this.api.createReservation(payload).subscribe({
        next: (res) => {
          this.snackBar.open('Reservation request sent!', 'Close', { duration: 3000 });
          this.dialogRef.close(true); // Return true to signal success
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Failed to create reservation.';
          this.snackBar.open(msg, 'Close', { duration: 3000 });
        }
      });
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
