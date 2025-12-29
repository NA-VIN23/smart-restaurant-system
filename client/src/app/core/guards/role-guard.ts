import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification.service';
import { firstValueFrom } from 'rxjs';

export const roleGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);
  const required = route.data['role'] as string | string[] | undefined;

  if (!auth.isLoggedIn()) {
    notify.error('Please login to access that page');
    router.navigate(['/login']);
    return false;
  }

  if (!auth.user) {
    try {
      await firstValueFrom(auth.loadProfile());
    } catch (err) {
      notify.error('Session expired. Please login again');
      router.navigate(['/login']);
      return false;
    }
  }

  if (!required) return true;

  const requiredRoles = Array.isArray(required) ? required : [required];
  if (requiredRoles.includes(auth.user?.role ?? '')) return true;

  notify.error('You are not authorized to access this page');
  router.navigate(['/not-authorized']);
  return false;
};
