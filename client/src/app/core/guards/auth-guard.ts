import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  // If token not present, redirect to login
  if (!auth.isLoggedIn()) {
    notify.error('Please login to access that page');
    router.navigate(['/login']);
    return false;
  }

  // If user info missing, attempt to load profile
  if (!auth.user) {
    try {
      await firstValueFrom(auth.loadProfile());
    } catch (err) {
      notify.error('Session expired. Please login again');
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};
