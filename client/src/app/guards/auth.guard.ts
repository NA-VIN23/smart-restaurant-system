import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const requiredRoles = route.data && (route.data as any).roles ? (route.data as any).roles as string[] : null;

  // Ensure current user is loaded
  const user = await auth.loadCurrentUser();
  if (!user) {
    return router.parseUrl('/login');
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return router.parseUrl('/not-authorized');
  }

  return true;
};
