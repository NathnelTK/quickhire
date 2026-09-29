import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      const response = error as HttpErrorResponse;
      const detail =
        typeof response?.error === 'string'
          ? response.error
          : (response?.error?.title ?? response?.message ?? 'Request failed');

      return throwError(() => new Error(detail, { cause: error }));
    })
  );
};
