import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="top-nav">
      <a routerLink="/tables">Tables</a> |
      <a routerLink="/queue">Queue</a> |
      <a routerLink="/reservation">Reservation</a> |
      <a routerLink="/manager/dashboard">Manager</a>
      <span style="float:right">
        <ng-container *ngIf="user; else loggedOut">
          {{ user.name }} ({{ user.role }}) <button (click)="logout()">Logout</button>
        </ng-container>
        <ng-template #loggedOut>
          <a routerLink="/login">Login</a> | <a routerLink="/signup">Sign up</a>
        </ng-template>
      </span>
    </nav>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: any = null;
  private sub?: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
    private socket: SocketService
  ) {}

  async ngOnInit() {
    // ensure current user is loaded on init
    await this.auth.loadCurrentUser();
    this.sub = this.auth.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.socket.connect();
      else this.socket.disconnect();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
