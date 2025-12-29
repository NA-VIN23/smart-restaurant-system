import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="nav">
      <a routerLink="/tables">Tables</a>
      <a routerLink="/queue">Queue</a>
      <a routerLink="/reservation">Reservation</a>
      <a *ngIf="hasRole('Manager')" routerLink="/manager/dashboard">Manager</a>
      <span style="flex:1"></span>
      <ng-container *ngIf="!isLoggedIn(); else logged">
        <a routerLink="/login">Login</a>
      </ng-container>
      <ng-template #logged>
        <span class="user">{{ userName() }}</span>
        <span *ngIf="userRole()" class="role">({{ userRole() }})</span>
        <a (click)="logout()" style="cursor:pointer">Logout</a>
      </ng-template>
    </nav>
  `,
  styles: [`.nav { display:flex; gap:12px; padding:8px; } .nav a{ text-decoration:none } .user{margin-right:8px}`]
})
export class Navbar {
  constructor(private auth: AuthService, private router: Router) {}

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  userName() {
    return this.auth.user?.name || '';
  }

  userRole() {
    return this.auth.user?.role || '';
  }

  hasRole(role: string) {
    return this.auth.hasRole(role);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

