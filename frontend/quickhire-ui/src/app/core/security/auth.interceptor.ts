import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_CONFIG } from '../api/api.config';
import { AuthService } from '../../features/auth/data-access/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const baseUrl = inject(API_CONFIG).baseUrl;
  const token = inject(AuthService).accessToken;
  if (!token || !request.url.startsWith(baseUrl)) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};