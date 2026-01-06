
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getUserRole();
    const allowedRoles = route.data['roles'] as Array<string>;

    if (allowedRoles.includes(userRole)) {
        return true;
    } else {
        // Redirect based on role
        if (userRole === 'Manager') {
            router.navigate(['/manager']);
        } else {
            router.navigate(['/home']);
        }
        return false;
    }
};
