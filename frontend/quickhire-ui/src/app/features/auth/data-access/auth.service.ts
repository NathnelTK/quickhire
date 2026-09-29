import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_CONFIG } from '../../../core/api/api.config';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const SESSION_KEY = 'quickhire.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly session = signal<LoginResponse | null>(this.restoreSession());

  get accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  get isAuthenticated(): boolean {
    const session = this.session();
    return !!session && new Date(session.expiresAt).getTime() > Date.now();
  }

  hasAnyRole(roles: readonly string[]): boolean {
    return this.isAuthenticated && (this.session()?.roles.some((role) => roles.includes(role)) ?? false);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.config.baseUrl}/api/auth/login`, request)
      .pipe(tap((session) => this.setSession(session)));
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  private setSession(session: LoginResponse): void {
    this.session.set(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private restoreSession(): LoginResponse | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
      const session = JSON.parse(stored) as LoginResponse;
      if (new Date(session.expiresAt).getTime() > Date.now()) return session;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}