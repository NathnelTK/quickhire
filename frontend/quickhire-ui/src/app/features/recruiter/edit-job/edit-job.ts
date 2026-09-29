import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService, JobType } from '../../../core/services/job.service';

@Component({
  selector: 'app-edit-job',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-job.html',
  styleUrl: '../post-job/post-job.scss',
  styles: [`
    .actions { display: flex; align-items: center; gap: 12px; }
    .actions .submit { width: auto; min-width: 170px; }
    .actions .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0 20px; border: 1px solid #4f46e5; border-radius: 12px; color: #4f46e5; font-size: 15px; font-weight: 600; text-decoration: none; }
    .back { display: inline-block; margin-bottom: 16px; color: #4f46e5; font-size: 14px; text-decoration: none; }
    @media (max-width: 640px) {
      .actions { flex-direction: column; }
      .actions .submit, .actions .btn { width: 100%; box-sizing: border-box; }
    }
  `]
})
export class EditJob {
  private readonly formBuilder = inject(FormBuilder);
  private readonly jobsService = inject(JobService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly types: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  readonly categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'Other'];
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly submitted = signal(false);
  readonly error = signal('');
  readonly job = signal<Job | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    company: ['', [Validators.required]],
    location: ['', [Validators.required]],
    type: ['Full-time' as JobType, [Validators.required]],
    category: ['Engineering', [Validators.required]],
    salaryRange: [''],
    status: ['active' as Job['status'], [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    requirements: ['']
  });

  constructor() {
    const jobId = this.route.snapshot.paramMap.get('id');
    const recruiterId = this.auth.currentUser()?.id;
    if (!jobId || !recruiterId) {
      this.loading.set(false);
      this.error.set('This job could not be found.');
      return;
    }

    this.jobsService.getJob(jobId).subscribe({
      next: (job) => {
        if (!job || job.recruiterId !== recruiterId) {
          this.error.set('This job could not be found.');
          this.loading.set(false);
          return;
        }

        this.job.set(job);
        this.form.patchValue({
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          category: job.category,
          salaryRange: job.salaryRange,
          status: job.status,
          description: job.description,
          requirements: job.requirements.join('\n')
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(error instanceof Error ? error.message : 'Could not load this job.');
      }
    });
  }

  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }

  submit(): void {
    this.submitted.set(true);
    this.error.set('');
    const currentJob = this.job();
    if (this.form.invalid || !currentJob) {
      this.form.markAllAsTouched();
      return;
    }

    const recruiterId = this.auth.currentUser()?.id;
    if (!recruiterId) {
      this.error.set('Sign in as a recruiter to update this job.');
      return;
    }

    const value = this.form.getRawValue();
    this.saving.set(true);
    this.jobsService
      .updateRecruiterJob(currentJob.id, recruiterId, {
        title: value.title.trim(),
        company: value.company.trim(),
        location: value.location.trim(),
        type: value.type,
        category: value.category,
        salaryRange: value.salaryRange.trim(),
        status: value.status,
        description: value.description.trim(),
        requirements: value.requirements
          .split('\n')
          .map((requirement) => requirement.trim())
          .filter(Boolean)
      })
      .subscribe({
        next: (job) => {
          this.saving.set(false);
          if (!job) {
            this.error.set('This job could not be found.');
            return;
          }
          void this.router.navigate(['/recruiter/jobs']);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.error.set(error instanceof Error ? error.message : 'Could not update this job.');
        }
      });
  }
}
