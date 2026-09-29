import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService, JobType } from '../../../core/services/job.service';

@Component({
  selector: 'app-post-job',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './post-job.html',
  styleUrl: './post-job.scss',
})
export class PostJob {
  private fb = inject(FormBuilder);
  private jobs = inject(JobService);
  private auth = inject(AuthService);

  types: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Other'];

  loading = signal(false);
  submitted = signal(false);
  posted = signal(false);
  errorMsg = signal('');

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    company: [this.auth.currentUser()?.company ?? '', [Validators.required]],
    location: ['', [Validators.required]],
    type: ['Full-time' as JobType, [Validators.required]],
    category: ['Engineering', [Validators.required]],
    salaryRange: [''],
    description: ['', [Validators.required, Validators.minLength(20)]],
    requirements: [''],
  });

  showError(ctrl: AbstractControl): boolean {
    return ctrl.invalid && (ctrl.touched || this.submitted());
  }

  submit(): void {
    this.submitted.set(true);
    this.errorMsg.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.loading.set(true);

    this.jobs
      .addJob({
        title: v.title.trim(),
        recruiterId: this.auth.currentUser()?.id,
        company: v.company.trim(),
        location: v.location.trim(),
        type: v.type,
        category: v.category,
        salaryRange: v.salaryRange.trim(),
        description: v.description.trim(),
        requirements: v.requirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.posted.set(true);
        },
        error: () => {
          this.loading.set(false);
          this.errorMsg.set('Something went wrong. Please try again.');
        },
      });
  }

  postAnother(): void {
    this.form.reset({
      company: this.auth.currentUser()?.company ?? '',
      type: 'Full-time',
      category: 'Engineering'
    });
    this.submitted.set(false);
    this.posted.set(false);
  }
}
