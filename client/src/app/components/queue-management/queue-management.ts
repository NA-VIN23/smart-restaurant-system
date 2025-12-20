import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketService } from '../../services/socket.service';

interface QueueEntry {
  id: number;
  user_id: number;
  party_size: number;
  status: string;
  queue_position: number;
  estimated_wait_time: number | null;
}

@Component({
  selector: 'app-queue-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './queue-management.html',
  styleUrls: ['./queue-management.css'],
})
export class QueueManagementComponent implements OnInit, AfterViewInit {
  form: any;
  myPosition: any = null;
  queue: QueueEntry[] = [];
  user: any = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private api: ApiService, private auth: AuthService, private snack: MatSnackBar, private socket: SocketService) {
    this.form = this.fb.group({ party_size: [2, [Validators.required, Validators.min(1)]] });
  }

  async ngOnInit() {
    this.user = await this.auth.loadCurrentUser();
    this.loadQueue();
    if (this.user) this.loadPosition();
  }

  async loadQueue() {
    this.api.getQueue().subscribe({ next: (q: any) => this.queue = q, error: () => {} });
  }

  async loadPosition() {
    if (!this.user) return;
    this.api.getQueuePosition(this.user.id).subscribe({ next: (d: any) => this.myPosition = d, error: () => this.myPosition = null });
  }

  join() {
    if (this.form.invalid || !this.user) return;
    const party = this.form.value.party_size;
    this.api.joinQueue(this.user.id, party).subscribe({
      next: async () => { this.loadQueue(); await this.loadPosition(); },
      error: (err) => { const msg = err?.error?.message ?? 'Failed to join queue'; this.error = msg; this.snack.open(msg, 'Close', { duration: 4000 }); },
      complete: () => this.snack.open('Joined queue', 'Close', { duration: 3000 })
    });
  }

  leave(entryId: number) {
    this.api.leaveQueue(entryId).subscribe({ next: () => { this.loadQueue(); this.loadPosition(); }, error: (e) => this.error = 'Failed to leave' });
  }

  seat(entry: QueueEntry, tableId: number) {
    this.api.updateQueueStatus(entry.id, 'seated', tableId).subscribe({ next: () => { this.loadQueue(); this.snack.open('Customer seated', 'Close', { duration: 3000 }); }, error: () => this.error = 'Failed to seat' });
  }
  
  // socket handling
  ngAfterViewInit() {
    try {
      this.socket.connect();
      this.socket.on('queue:update', () => this.loadQueue());
      this.socket.on('reservation:created', () => this.loadQueue());
    } catch (e) {
      // ignore
    }
  }
}
