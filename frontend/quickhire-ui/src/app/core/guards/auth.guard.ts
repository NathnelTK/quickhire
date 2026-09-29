import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLE_LANDING_PATH, UserRole } from '../models/auth.model';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()) {
    return true;
  }

  const requestedRole: UserRole = state.url.startsWith('/recruiter') ||
    state.url.startsWith('/dashboard') ||
    state.url.startsWith('/employees') ||
    state.url.startsWith('/departments') ||
    state.url.startsWith('/recruitment')
    ? 'Recruiter'
    : 'JobSeeker';

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url, role: requestedRole }
  });
};

export function roleGuard(...allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    return router.parseUrl(user ? ROLE_LANDING_PATH[user.role] : '/');
  };
}
