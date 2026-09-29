import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ROLE_LANDING_PATH, UserRole, toRole } from '../../../../core/models/auth.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AuthShell } from '../../components/auth-shell/auth-shell';

const MESSAGES = {
  email: {
    required: 'Email is required',
    email: 'Please enter a valid email address'
  },
  password: {
    required: 'Password is required',
    minlength: 'Password must be at least 6 characters'
  }
} as const;

type FieldName = keyof typeof MESSAGES;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly role = signal<UserRole>(toRole(this.route.snapshot.queryParamMap.get('role')));
  protected get signupQueryParams() {
    return {
      role: this.role(),
      returnUrl: this.route.snapshot.queryParamMap.get('returnUrl')
    };
  }
  protected readonly panelText = signal('');
  protected readonly showPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly requestError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: [this.auth.rememberedEmail() ?? '', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [this.auth.rememberedEmail() !== null]
  });

  protected errorFor(name: FieldName): string {
    const errors = this.form.controls[name].errors ?? {};
    for (const [key, text] of Object.entries(MESSAGES[name])) {
      if (errors[key]) {
        return text;
      }
    }
    return '';
  }

  protected showError(name: FieldName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected changeRole(): void {
    const next: UserRole = this.role() === 'Recruiter' ? 'JobSeeker' : 'Recruiter';
    this.role.set(next);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { role: next },
      queryParamsHandling: 'merge'
    });
  }

  protected submit(): void {
    this.requestError.set('');
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth
      .login(email, password, this.role())
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.auth.rememberEmail(remember ? email : null);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          void this.router.navigateByUrl(
            returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
              ? returnUrl
              : ROLE_LANDING_PATH[this.role()]
          );
        },
        error: (error: unknown) => {
          this.requestError.set(
            error instanceof Error ? error.message : 'Could not sign in. Please try again.'
          );
        }
      });
  }
}
