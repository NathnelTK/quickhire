import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../features/auth/data-access/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const requiredRoles = route.data['roles'] as string[] | undefined;
  return !requiredRoles || auth.hasAnyRole(requiredRoles)
    ? true
    : router.createUrlTree(['/jobs']);
};