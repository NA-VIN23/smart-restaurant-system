import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.css'],
})
export class ReservationComponent implements OnInit {
  form: any;
  availableTables: any[] = [];
  user: any = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private api: ApiService, private auth: AuthService, private snack: MatSnackBar, private socket: SocketService) {
    this.form = this.fb.group({ date: ['', Validators.required], time: ['', Validators.required], party_size: [2, [Validators.required, Validators.min(1)]] });
  }

  async ngOnInit() { this.user = await this.auth.loadCurrentUser(); }

  findTables() {
    if (this.form.invalid) return;
    const { date, time, party_size } = this.form.value as { date: string; time: string; party_size: number };
    this.api.getAvailableTables(date, time, party_size).subscribe({ next: (tables) => this.availableTables = tables, error: (e) => this.error = 'Failed to load tables' });
  }

  book(tableId: number) {
    if (!this.user) { this.error = 'Please login to book'; return; }
    const date = this.form.value.date as string;
    const time = this.form.value.time as string;
    const party = this.form.value.party_size as number;
    const payload = { user_id: this.user.id, table_id: tableId, reservation_time: `${date}T${time}`, party_size: party };
    this.api.createReservation(payload).subscribe({ next: () => { this.availableTables = []; this.snack.open('Reservation created', 'Close', { duration: 3000 }); this.socket.emit('reservation:create', {}); }, error: (e) => { this.error = e?.error?.message || 'Failed to book'; this.snack.open(this.error || 'Failed to book', 'Close', { duration: 4000 }); } });
  }

}
