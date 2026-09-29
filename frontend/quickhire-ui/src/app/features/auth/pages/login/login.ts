import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="login">
      <div class="login__intro">
        <p class="login__eyebrow">QUICKHIRE / TEAM PORTAL</p>
        <h1>Good work starts with good people.</h1>
        <p>Sign in to manage employees, departments, roles, and applicants.</p>
      </div>
      <form class="login__form" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Sign in</h2>
        <label class="field">
          <span class="field__label">Work email</span>
          <input class="field__input" type="email" formControlName="email" autocomplete="username" />
        </label>
        <label class="field">
          <span class="field__label">Password</span>
          <input class="field__input" type="password" formControlName="password" autocomplete="current-password" />
        </label>
        @if (error(); as message) {
          <p class="login__error" role="alert">{{ message }}</p>
        }
        <button class="button button--primary" type="submit" [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </section>
  `,
  styles: `
    .login { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(17rem, 0.8fr); gap: clamp(2rem, 8vw, 7rem); align-items: center; max-width: 62rem; min-height: 65vh; margin: 2rem auto; }
    .login__intro { max-width: 34rem; }
    .login__eyebrow { color: #147d72; font-size: 0.75rem; font-weight: 700; }
    h1 { margin: 0.7rem 0 1rem; font-family: Georgia, 'Times New Roman', serif; font-size: 3.5rem; line-height: 1.05; }
    .login__intro > p:last-child { max-width: 27rem; color: #59656a; }
    .login__form { display: grid; gap: 1rem; padding: 1.5rem; border: 1px solid #d7dedb; border-radius: 0.375rem; background: #fff; }
    .login__form h2 { margin: 0; font-size: 1.25rem; }
    .login__error { margin: 0; color: #a21d25; }
    @media (max-width: 44rem) { .login { grid-template-columns: 1fr; align-content: start; gap: 1.5rem; margin: 1rem auto; } h1 { font-size: 2.4rem; } }
  `
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const target = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(target ?? (this.auth.hasAnyRole(['Recruiter', 'Administrator']) ? '/recruiter' : '/jobs'));
      },
      error: (error: Error) => {
        this.loading.set(false);
        this.error.set(error.message);
      }
    });
  }
}