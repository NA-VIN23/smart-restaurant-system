import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TableService, TableModel } from '../../../core/services/table.service';
import { QueueService } from '../../../core/services/queue.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './table-list.html',
  styleUrls: ['./table-list.scss']
})
export class TableList implements OnInit {
  protected tables = signal<TableModel[]>([]);

  constructor(private svc: TableService, private queueSvc: QueueService, private notify: NotificationService, private auth: AuthService) {}

  ngOnInit() {
    this.svc.list().subscribe((t) => this.tables.set(t));
  }

  joinQueue(table: TableModel) {
    // require authentication
    if (!this.auth.isLoggedIn()) {
      this.notify.error('Please login to join the queue');
      return;
    }

    // join with table capacity and type preference
    const payload = { capacity_needed: table.capacity, type_preference: table.type };
    this.queueSvc.join(payload).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.notify.success('Joined queue. Position: ' + (data?.queue_position ?? '?'));
      },
      error: (err: any) => this.notify.error(err?.message || 'Failed to join queue')
    });
  }
}

