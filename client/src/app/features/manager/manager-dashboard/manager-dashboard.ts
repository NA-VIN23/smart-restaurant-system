import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TableService } from '../../../core/services/table.service';
import { QueueService } from '../../../core/services/queue.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.scss']
})
export class ManagerDashboard implements OnInit {
  protected tables = signal([] as any[]);

  constructor(private svc: TableService, private queueSvc: QueueService, private notify: NotificationService) {}

  ngOnInit() {
    this.svc.list().subscribe((t) => this.tables.set(t));
  }

  seat(table: any) {
    this.queueSvc.seat(table.id).subscribe({
      next: () => {
        this.notify.success('Customer seated');
        this.refresh();
      },
      error: (err: any) => this.notify.error(err?.message || 'Failed to seat customer')
    });
  }

  vacate(table: any) {
    this.svc.vacate(table.id).subscribe({
      next: () => {
        this.notify.success('Table vacated');
        this.refresh();
      },
      error: (err: any) => this.notify.error(err?.message || 'Failed to vacate table')
    });
  }

  refresh() {
    this.svc.list().subscribe((t) => this.tables.set(t));
  }
}
