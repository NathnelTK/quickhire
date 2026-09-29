import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { API_CONFIG } from '../api/api.config';
import { AuthUser, UserRole, toRole } from '../models/auth.model';

const SESSION_KEY = 'quickhire.session.user';
const REMEMBERED_EMAIL_KEY = 'quickhire.remembered.email';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  name: string;
  roles: string[];
}

function getTokenClaims(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('The sign-in response contained an invalid access token.');
  }
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch (error) {
    throw new Error('The sign-in response contained an unreadable access token.', { cause: error });
  }
}

function toApiRole(value: string): UserRole | null {
  switch (value.toLowerCase()) {
    case 'recruiter':
      return 'Recruiter';
    case 'administrator':
    case 'admin':
      return 'Administrator';
    case 'employee':
      return 'Employee';
    case 'jobseeker':
    case 'job-seeker':
    case 'applicant':
      return 'JobSeeker';
    default:
      return null;
  }
}

function readSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    const stored = JSON.parse(raw) as Partial<AuthUser>;
    if (
      typeof stored.id !== 'string' ||
      typeof stored.name !== 'string' ||
      typeof stored.email !== 'string' ||
      typeof stored.role !== 'string' ||
      typeof stored.accessToken !== 'string' ||
      typeof stored.expiresAt !== 'number' ||
      !Number.isFinite(stored.expiresAt) ||
      ![
        'jobseeker',
        'job-seeker',
        'applicant',
        'employee',
        'recruiter',
        'administrator',
        'admin'
      ].includes(
        stored.role.toLowerCase()
      )
    ) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }

    const user: AuthUser = {
      id: stored.id,
      name: stored.name,
      email: stored.email,
      role: toRole(stored.role),
      accessToken: stored.accessToken,
      ...(typeof stored.company === 'string' ? { company: stored.company } : {}),
      expiresAt: stored.expiresAt
    };
    if (user.expiresAt !== undefined && user.expiresAt <= Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function readRememberedEmail(): string | null {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly router = inject(Router);
  private readonly user = signal<AuthUser | null>(readSession());
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;

  readonly currentUser = computed(() => this.user());
  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly rememberedEmail = signal<string | null>(readRememberedEmail());

  constructor() {
    this.scheduleExpiry(this.user());
  }

  login(email: string, password: string, requestedRole: UserRole): Observable<AuthUser> {
    const request: LoginRequest = { email: email.trim(), password };
    return this.http
      .post<LoginResponse>(`${this.config.baseUrl}/api/auth/login`, request)
      .pipe(
        map((response) => this.mapLoginResponse(response, request.email, requestedRole)),
        tap((user) => this.setUser(user))
      );
  }

  logout(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable; in-memory state is cleared regardless */
    }
    this.user.set(null);
  }

  /** Stores the email only. A password is never persisted anywhere. */
  rememberEmail(email: string | null): void {
    this.rememberedEmail.set(email);
    try {
      if (email) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch {
      /* storage unavailable; nothing to clean up */
    }
  }

  private mapLoginResponse(
    response: LoginResponse,
    email: string,
    requestedRole: UserRole
  ): AuthUser {
    const expiresAt = Date.parse(response.expiresAt);
    if (
      !response.accessToken ||
      !response.name ||
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      throw new Error('The sign-in response from the server is incomplete or expired.');
    }
    const roles = response.roles?.map(toApiRole).filter((role): role is UserRole => role !== null);
    if (!roles?.length) {
      throw new Error('Your account does not have a supported QuickHire role.');
    }
    const availableRole = roles.find((candidate) => candidate === requestedRole);
    if (!availableRole) {
      throw new Error(`This account does not have the ${requestedRole} role.`);
    }

    const claims = getTokenClaims(response.accessToken);
    const id =
      (typeof claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ===
      'string'
        ? claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        : undefined) ??
      (typeof claims['sub'] === 'string' ? claims['sub'] : undefined);
    if (!id) {
      throw new Error('The sign-in response token does not contain a user identifier.');
    }

    return {
      id,
      name: response.name,
      email,
      role: availableRole,
      accessToken: response.accessToken,
      expiresAt
    };
  }

  private setUser(user: AuthUser): void {
    this.user.set(user);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {
      /* storage unavailable; in-memory state covers the session */
    }
    this.scheduleExpiry(user);
  }

  private scheduleExpiry(user: AuthUser | null): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
    if (!user?.expiresAt) {
      return;
    }

    const delayMs = user.expiresAt - Date.now();
    if (delayMs <= 0) {
      this.expireSession(user);
      return;
    }

    this.expiryTimer = setTimeout(() => this.expireSession(user), delayMs);
  }

  private expireSession(user: AuthUser): void {
    if (this.user()?.id !== user.id) {
      return;
    }
    const returnUrl = this.router.url;
    this.logout();
    void this.router.navigate(['/login'], {
      queryParams: { role: user.role, ...(returnUrl !== '/' ? { returnUrl } : {}) }
    });
  }
}
