import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReservationService } from '../../../core/services/reservation.service';
import { TableService, TableModel } from '../../../core/services/table.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './reservation-form.html',
  styleUrls: ['./reservation-form.scss']
})
export class ReservationForm {
  protected name = '';
  protected time = '';
  protected tables: TableModel[] = [];
  protected tableId: number | null = null;

  constructor(private svc: ReservationService, private tableSvc: TableService, private notify: NotificationService) {
    this.tableSvc.list().subscribe((t) => (this.tables = t));
  }

  submit() {
    if (!this.tableId) {
      this.notify.error('Select a table');
      return;
    }

    this.svc.create({ table_id: this.tableId, reservation_time: this.time }).subscribe({
      next: () => this.notify.success('Reservation created'),
      error: (err: any) => this.notify.error(err?.message || 'Failed to create reservation')
    });
  }
}
