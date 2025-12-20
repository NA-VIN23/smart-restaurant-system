<<<<<<< HEAD
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
=======

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
>>>>>>> origin/main
};
