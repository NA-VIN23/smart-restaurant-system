import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css'],
})
export class ManagerDashboardComponent implements OnInit {
  tables: any[] = [];
  queue: any[] = [];
  form: any;
  error: string | null = null;

  constructor(private api: ApiService, private auth: AuthService, private fb: FormBuilder, private snack: MatSnackBar, private socket: SocketService) {
    this.form = this.fb.group({ table_number: [null, Validators.required], capacity: [2, [Validators.required, Validators.min(1)]], type: ['regular'] });
  }

  ngOnInit() {
    this.loadTables();
    this.loadQueue();
  }

  loadTables() {
    this.api.getTables().subscribe({ next: (t: any) => this.tables = t, error: () => {} });
  }

  loadQueue() {
    this.api.getQueue().subscribe({ next: (q: any) => this.queue = q, error: () => {} });
  }

  createTable() {
    if (this.form.invalid) return;
    this.api.createTable(this.form.value).subscribe({ next: () => { this.loadTables(); this.form.reset({ capacity: 2, type: 'regular' }); this.snack.open('Table created', 'Close', { duration: 3000 }); this.socket.emit('table:update', {}); }, error: (e) => this.error = e?.error?.message || 'Failed' });
  }

  updateTable(id: number, changes: any) {
    this.api.updateTable(id, changes).subscribe({ next: () => this.loadTables(), error: () => this.error = 'Failed to update' });
  }

  deleteTable(id: number) {
    this.api.deleteTable(id).subscribe({ next: () => this.loadTables(), error: () => this.error = 'Failed to delete' });
  }
}
