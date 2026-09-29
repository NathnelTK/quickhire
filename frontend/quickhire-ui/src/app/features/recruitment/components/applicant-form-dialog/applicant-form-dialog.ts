import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApplicantService } from '../../data-access/applicant.service';
import { JobPosting } from '../../models/recruitment.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-applicant-form-dialog',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './applicant-form-dialog.html',
  styleUrl: './applicant-form-dialog.scss'
})
export class ApplicantFormDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly applicantService = inject(ApplicantService);
  private readonly toasts = inject(ToastService);

  readonly job = input<JobPosting | null>(null);
  readonly closed = output<void>();

  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    effect(() => {
      if (this.job()) {
        this.form.reset({ firstName: '', lastName: '', email: '' });
        this.formError.set(null);
      }
    });
  }

  protected control(name: keyof typeof this.form.controls) {
    return this.form.controls[name];
  }

  protected isInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.control(name);
    return control.invalid && (control.dirty || control.touched);
  }

  protected submit(): void {
    const job = this.job();
    if (this.form.invalid || !job) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set(null);

    this.applicantService
      .submit({ ...value, jobPostingId: job.id })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toasts.success(`Application sent for ${job.title}.`);
          this.closed.emit();
        },
        error: (error: Error) => {
          this.saving.set(false);
          this.formError.set(error.message);
        }
      });
  }
}
