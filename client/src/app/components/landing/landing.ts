
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JoinQueueDialogComponent } from '../join-queue-dialog/join-queue-dialog';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>Experience Dining <span class="highlight">Reimagined</span>.</h1>
          <p>Join the queue, book a table, or just browse. Smarter dining starts here.</p>
        </div>
      </section>

      <!-- Action Cards Section -->
      <section class="actions-section">
        <div class="card-grid">
          
          <!-- View Tables -->
          <div class="action-card" (click)="navigateTo('/tables')">
            <div class="icon-wrapper primary">
              <mat-icon>table_restaurant</mat-icon>
            </div>
            <h3>View Tables</h3>
            <p>Check real-time availability and find your perfect spot.</p>
            <button mat-button color="primary">Explore <mat-icon>arrow_forward</mat-icon></button>
          </div>

          <!-- Join Queue -->
          <div class="action-card" (click)="openJoinQueue()">
            <div class="icon-wrapper accent">
              <mat-icon>people</mat-icon>
            </div>
            <h3>Join Queue</h3>
            <p>Skip the wait by joining our smart digital queue.</p>
            <button mat-button color="accent">Join Now <mat-icon>arrow_forward</mat-icon></button>
          </div>

          <!-- Reservation -->
          <div class="action-card" (click)="navigateTo('/reservation')">
            <div class="icon-wrapper warn">
              <mat-icon>event</mat-icon>
            </div>
            <h3>Make Reservation</h3>
            <p>Plan ahead and book a table for your special occasion.</p>
            <button mat-button color="warn">Book <mat-icon>arrow_forward</mat-icon></button>
          </div>

        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 8rem 1rem 4rem;
      background: radial-gradient(circle at center, rgba(79, 70, 229, 0.05) 0%, rgba(255,255,255,0) 70%);
    }

    .hero h1 {
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--text-main, #1e293b);
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .hero .highlight {
      color: var(--primary-color, #4f46e5);
      background: -webkit-linear-gradient(45deg, #4f46e5, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.25rem;
      color: var(--text-muted, #64748b);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Actions Section */
    .actions-section {
      padding: 2rem 1rem 6rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .action-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .icon-wrapper.primary { background-color: rgba(79, 70, 229, 0.1); color: var(--primary-color); }
    .icon-wrapper.accent { background-color: rgba(6, 182, 212, 0.1); color: var(--accent-color); }
    .icon-wrapper.warn { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .icon-wrapper mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .action-card h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }

    .action-card p {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .action-card button {
      margin-top: auto;
    }
  `]
})
export class LandingComponent {

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  openJoinQueue() {
    const dialogRef = this.dialog.open(JoinQueueDialogComponent, {
      width: '350px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const userId = this.auth.getUserId();
        const queueData = { ...result, userId: userId || null };

        this.api.joinQueue(queueData).subscribe({
          next: (res: any) => {
            if (res.id) {
              const current = sessionStorage.getItem('guestQueueId');
              let ids: number[] = [];
              if (current) {
                if (current.startsWith('[')) {
                  try { ids = JSON.parse(current); } catch (e) { ids = []; }
                } else {
                  ids = [parseInt(current)];
                }
              }
              ids.push(res.id);
              sessionStorage.setItem('guestQueueId', JSON.stringify(ids));
            }
            this.snackBar.open('You have joined the waitlist!', 'Close', { duration: 3000 });
            this.router.navigate(['/queue']);
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error joining queue. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
