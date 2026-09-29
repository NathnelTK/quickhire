import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, tap } from 'rxjs';

import { UserRole, toRole } from '../../../../core/models/auth.model';
import { AuthShell } from '../../components/auth-shell/auth-shell';

const MESSAGES = {
  name: {
    required: 'Full name is required'
  },
  email: {
    required: 'Email is required',
    email: 'Please enter a valid email address'
  },
  password: {
    required: 'Password is required',
    minlength: 'Password must be at least 6 characters'
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match'
  },
  company: {
    required: 'Company name is required'
  }
} as const;

type FieldName = keyof typeof MESSAGES;

const matchesPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.parent?.get('password')?.value;
  if (!password || !control.value) {
    return null;
  }
  return password === control.value ? null : { mismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: this.fb.nonNullable.control('', [Validators.required, matchesPassword]),
    company: this.fb.control('', [Validators.required])
  });

  // The selected account type lives in the role query parameter.
  protected readonly role = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => toRole(params.get('role'))),
      tap((role) => this.applyRole(role))
    ),
    { initialValue: toRole(this.route.snapshot.queryParamMap.get('role')) }
  );
  protected readonly panelText = signal('');
  protected get loginQueryParams() {
    return {
      role: this.role(),
      returnUrl: this.route.snapshot.queryParamMap.get('returnUrl')
    };
  }
  protected readonly roleLabel = computed(() =>
    this.role() === 'Recruiter' ? 'Signing up as a recruiter' : 'Signing up as a jobseeker'
  );
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly submitted = signal(false);

  protected control(name: FieldName) {
    return this.form.controls[name];
  }

  protected errorFor(name: FieldName): string {
    const errors = this.control(name).errors ?? {};
    for (const [key, text] of Object.entries(MESSAGES[name])) {
      if (errors[key]) {
        return text;
      }
    }
    return '';
  }

  protected showError(name: FieldName): boolean {
    const control = this.control(name);
    return control.invalid && (control.touched || this.submitted());
  }

  constructor() {
    this.applyRole(this.role());
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() =>
        this.form.controls.confirmPassword.updateValueAndValidity({ emitEvent: false })
      );
  }

  private applyRole(role: UserRole): void {
    const company = this.control('company');
    if (role === 'Recruiter') {
      company.setValidators([Validators.required]);
    } else {
      company.clearValidators();
      company.reset();
    }
    company.updateValueAndValidity({ emitEvent: false });
  }

  protected changeRole(): void {
    const next: UserRole = this.role() === 'Recruiter' ? 'JobSeeker' : 'Recruiter';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { role: next },
      queryParamsHandling: 'merge'
    });
  }

  protected togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((visible) => !visible);
  }

}
