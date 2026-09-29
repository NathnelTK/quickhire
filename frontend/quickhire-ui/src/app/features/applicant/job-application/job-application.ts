import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService } from '../../../core/services/job.service';

const DATABASE_NAME = 'quickhire-applications';
const DATABASE_VERSION = 2;
const STORE_NAME = 'applications';
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const ACCEPTED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);
const ACCEPTED_RESUME_EXTENSIONS = /\.(pdf|doc|docx)$/i;

interface SavedApplication {
  id: string;
  jobId: string;
  applicantId: string;
  name: string;
  email: string;
  phone: string;
  coverLetter: string;
  status: string;
  submittedAt: string;
  resume: File;
}

function findApplication(
  jobId: string,
  applicantId: string,
  email: string
): Promise<SavedApplication | undefined> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onerror = () =>
      reject(request.error ?? new Error('Could not open application storage.'));
    request.onsuccess = () => {
      const database = request.result;
      let query: IDBRequest<SavedApplication[]>;
      try {
        query = database
          .transaction(STORE_NAME, 'readonly')
          .objectStore(STORE_NAME)
          .getAll() as IDBRequest<SavedApplication[]>;
      } catch (error) {
        database.close();
        reject(error instanceof Error ? error : new Error('Could not read saved applications.'));
        return;
      }
      query.onsuccess = () => {
        database.close();
        const applications = query.result;
        resolve(
          applications.find(
            (application) =>
              application.jobId === jobId &&
              (application.applicantId === applicantId ||
                (!application.applicantId &&
                  application.email.toLowerCase() === email.toLowerCase()))
          )
        );
      };
      query.onerror = () => {
        database.close();
        reject(query.error ?? new Error('Could not read saved applications.'));
      };
    };
  });
}

function saveApplication(application: SavedApplication): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onerror = () => reject(request.error ?? new Error('Could not open application storage.'));
    request.onsuccess = () => {
      const database = request.result;
      let transaction: IDBTransaction;
      try {
        transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(application);
      } catch (error) {
        database.close();
        reject(error instanceof Error ? error : new Error('Could not save your application.'));
        return;
      }
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error ?? new Error('Could not save your application.'));
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error ?? new Error('Application storage was interrupted.'));
      };
    };
  });
}

@Component({
  selector: 'app-job-application',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <a class="back" [routerLink]="['/jobs', jobId()]">Back to job</a>
      @if (loading()) {
        <section class="card"><p>Loading job...</p></section>
      } @else if (job(); as currentJob) {
        <section class="card">
          <h1>{{ existingApplication() ? 'Update application' : 'Apply for ' + currentJob.title }}</h1>
          @if (currentJob.company || currentJob.location) {
            <p class="company">{{ currentJob.company }}{{ currentJob.company && currentJob.location ? ' · ' : '' }}{{ currentJob.location }}</p>
          }
          @if (submitted()) {
            <div class="success" role="status">
              <h2>{{ existingApplication() ? 'Application updated' : 'Application saved' }}</h2>
              <p>
                Your application and resume for {{ currentJob.title }} have been
                {{ existingApplication() ? 'updated' : 'saved' }} on this device.
              </p>
              <p class="notice">Applications are not yet sent to the employer because server-side application uploads are not configured.</p>
              <a class="btn primary" [routerLink]="['/jobs', currentJob.id]">Back to job</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
              <p class="notice" role="note">
                Resume uploads are not supported by the API yet. Your selected file stays in this browser and is not sent to the employer.
              </p>
              @if (applicationLoading()) {
                <p aria-live="polite">Checking for an existing application...</p>
              } @else {
                @if (existingApplication()) {
                  <p class="notice">You have already applied for this job. Update your details below and save your changes.</p>
                }
              <label>
                Full name
                <input type="text" formControlName="name" autocomplete="name" placeholder="Enter your full name" />
              </label>
              @if (invalid('name')) { <span class="error">Name is required.</span> }
              <label>
                Email
                <input type="email" formControlName="email" autocomplete="email" />
              </label>
              @if (invalid('email')) { <span class="error">Enter a valid email address.</span> }
              <label>
                Phone number
                <input type="tel" formControlName="phone" autocomplete="tel" />
              </label>
              @if (invalid('phone')) { <span class="error">Phone number is required.</span> }
              <label>
                {{ existingApplication() ? 'Replace resume / CV' : 'Resume / CV' }}
                <span class="required">
                  ({{ existingApplication() ? 'optional' : 'required' }}, PDF or Word document, up to 5 MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  (change)="selectResume($event)"
                  [attr.aria-invalid]="resumeError() ? 'true' : null"
                />
              </label>
              @if (resume(); as selectedResume) {
                <p class="file-name">{{ existingApplication() ? 'Current resume:' : 'Selected:' }} {{ selectedResume.name }}</p>
              }
              @if (resumeError()) { <span class="error" role="alert">{{ resumeError() }}</span> }
              <label>
                Cover letter <span class="optional">(optional)</span>
                <textarea rows="5" formControlName="coverLetter" placeholder="Tell the employer why you're a good fit."></textarea>
              </label>
              @if (formError()) { <p class="error" role="alert">{{ formError() }}</p> }
              <div class="actions">
                <button class="btn primary" type="submit" [disabled]="saving() || applicationLoading()">
                  {{ saving() ? 'Saving...' : existingApplication() ? 'Save changes' : 'Submit application' }}
                </button>
                @if (existingApplication()) {
                  <button class="btn secondary" type="button" (click)="cancelChanges()" [disabled]="saving()">
                    Cancel
                  </button>
                }
              </div>
              }
            </form>
          }
        </section>
      } @else if (jobError(); as message) {
        <section class="card" role="alert">
          <h1>Could not load the job</h1>
          <p class="notice">{{ message }}</p>
          <button class="btn primary" type="button" (click)="loadJob()">Retry</button>
          <a class="btn secondary" routerLink="/jobs">Back to jobs</a>
        </section>
      } @else {
        <section class="card">
          <h1>Job not found</h1>
          <a class="btn primary" routerLink="/jobs">Back to jobs</a>
        </section>
      }
    </div>
  `,
  styles: `
    .page { max-width: 760px; margin: 0 auto; }
    .back { display: inline-block; margin-bottom: 1rem; }
    .card { padding: 2rem; }
    .company { color: #64748b; margin-bottom: 1.5rem; }
    form { display: grid; gap: 0.75rem; max-width: 32rem; }
    label { display: grid; gap: 0.4rem; font-weight: 600; }
    input, textarea { padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font: inherit; }
    input[type="file"] { background: #f8fafc; }
    .required, .optional { color: #64748b; font-size: 0.85rem; font-weight: 400; }
    .file-name { margin: 0; color: #334155; font-size: 0.9rem; }
    .error { color: #b91c1c; font-size: 0.875rem; }
    .success { padding-top: 1rem; }
    .notice { max-width: 36rem; color: #7c2d12; }
    .actions { display: flex; gap: 0.75rem; }
    .btn { display: inline-block; border: 0; border-radius: 0.5rem; padding: 0.7rem 1rem; font: inherit; cursor: pointer; text-decoration: none; }
    .primary { color: #fff; background: #4f46e5; }
    .secondary { color: #334155; background: #e2e8f0; }
    .primary:disabled { cursor: wait; opacity: 0.7; }
  `
})
export class JobApplication {
  private readonly route = inject(ActivatedRoute);
  private readonly jobs = inject(JobService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly jobId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly job = signal<Job | undefined>(undefined);
  readonly loading = signal(true);
  readonly jobError = signal('');
  readonly submitted = signal(false);
  readonly resume = signal<File | null>(null);
  readonly existingApplication = signal<SavedApplication | null>(null);
  readonly applicationLoading = signal(true);
  readonly resumeError = signal('');
  readonly formError = signal('');
  readonly saving = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
    email: [this.auth.currentUser()?.email ?? '', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    coverLetter: ['']
  });

  constructor() {
    const user = this.auth.currentUser();
    if (!user) {
      this.applicationLoading.set(false);
      this.formError.set('Sign in to apply for this job.');
    } else {
      void findApplication(this.jobId(), user.id, user.email)
        .then((application) => {
          if (application) {
            this.existingApplication.set(application);
            this.resume.set(application.resume);
            this.form.patchValue({
              name: application.name,
              email: application.email,
              phone: application.phone,
              coverLetter: application.coverLetter
            });
          }
        })
        .catch((error: unknown) => {
          this.formError.set(
            error instanceof Error
              ? `Could not check for an existing application: ${error.message}`
              : 'Could not check for an existing application.'
          );
        })
        .finally(() => this.applicationLoading.set(false));
    }

    this.loadJob();
  }

  loadJob(): void {
    this.loading.set(true);
    this.jobError.set('');
    this.jobs.getJob(this.jobId()).subscribe({
      next: (job) => {
        this.job.set(job);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.jobError.set(error instanceof Error ? error.message : 'Could not load this job.');
        this.loading.set(false);
      }
    });
  }

  cancelChanges(): void {
    const application = this.existingApplication();
    if (!application) return;
    this.form.reset({
      name: application.name,
      email: application.email,
      phone: application.phone,
      coverLetter: application.coverLetter
    });
    this.resume.set(application.resume);
    this.resumeError.set('');
    this.formError.set('');
  }

  invalid(name: 'name' | 'email' | 'phone'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  selectResume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.resumeError.set('');

    if (!file) {
      if (!this.existingApplication()) this.resume.set(null);
      return;
    }
    if (!ACCEPTED_RESUME_TYPES.has(file.type) && !ACCEPTED_RESUME_EXTENSIONS.test(file.name)) {
      input.value = '';
      this.resumeError.set('Upload your resume as a PDF, DOC, or DOCX file.');
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      input.value = '';
      this.resumeError.set('Your resume must be 5 MB or smaller.');
      return;
    }
    this.resume.set(file);
  }

  async submit(): Promise<void> {
    this.formError.set('');
    if (
      this.form.invalid ||
      !this.job() ||
      !this.resume() ||
      this.applicationLoading() ||
      !this.auth.currentUser()
    ) {
      this.form.markAllAsTouched();
      if (!this.resume() && !this.existingApplication()) {
        this.resumeError.set('Please attach your resume before submitting.');
      }
      return;
    }

    const values = this.form.getRawValue();
    const selectedResume = this.resume();
    const currentJob = this.job();
    const user = this.auth.currentUser();
    if (!selectedResume || !currentJob || !user) return;

    this.saving.set(true);
    try {
      const application: SavedApplication = {
        id: this.existingApplication()?.id ?? crypto.randomUUID(),
        jobId: this.jobId(),
        applicantId: user.id,
        ...values,
        status: this.existingApplication()?.status ?? 'Received',
        submittedAt: new Date().toISOString(),
        resume: selectedResume
      };
      await saveApplication(application);
      this.existingApplication.set(application);
      this.submitted.set(true);
    } catch (error) {
      this.formError.set(
        error instanceof Error
          ? `Could not save your application: ${error.message}`
          : 'Could not save your application. Please try again.'
      );
    } finally {
      this.saving.set(false);
    }
  }
}
