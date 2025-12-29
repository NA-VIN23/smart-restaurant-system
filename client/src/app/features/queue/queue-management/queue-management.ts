import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QueueService } from '../../../core/services/queue.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-queue-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './queue-management.html',
  styleUrls: ['./queue-management.scss']
})
export class QueueManagement implements OnInit {
  protected name = '';
  protected capacityNeeded = 2;
  protected typePreference: string | null = null;
  protected position = signal<number | null>(null);

  constructor(private svc: QueueService, private notify: NotificationService, private auth: AuthService) {}

  ngOnInit() {}

  join() {
    // require authentication
    if (!this.auth.isLoggedIn()) {
      this.notify.error('Please login to join the queue');
      return;
    }

    const payload = {
      capacity_needed: this.capacityNeeded,
      type_preference: this.typePreference || undefined
    };

    this.svc.join(payload).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        this.position.set(data?.queue_position ?? null);
        this.notify.success('Joined queue. Position: ' + (data?.queue_position ?? '?'));
      },
      error: (err: any) => this.notify.error(err?.message || 'Failed to join queue')
    });
  }

  refreshPosition() {
    // placeholder: call position API when user is known
  }
}

