import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const response = error instanceof HttpErrorResponse ? error : null;
      const user = auth.currentUser();
      if (response?.status === 401 && user) {
        const returnUrl = router.url;
        auth.logout();
        void router.navigate(['/login'], {
          queryParams: {
            role: user.role,
            ...(returnUrl !== '/' ? { returnUrl } : {})
          }
        });
      }

      const detail =
        typeof response?.error === 'string'
          ? response.error
          : (response?.error?.message ??
            response?.error?.title ??
            response?.message ??
            (error instanceof Error ? error.message : 'Request failed'));

      return throwError(() => new Error(detail, { cause: error }));
    })
  );
};
