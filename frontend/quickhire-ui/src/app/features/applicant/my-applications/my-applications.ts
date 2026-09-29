import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService } from '../../../core/services/job.service';

const DATABASE_NAME = 'quickhire-applications';
const DATABASE_VERSION = 2;
const STORE_NAME = 'applications';

interface SavedApplication {
  id: string;
  jobId: string;
  applicantId?: string;
  name: string;
  email: string;
  status?: string;
  submittedAt: string;
}

interface ApplicationRow extends SavedApplication {
  job?: Job;
}

function readApplications(): Promise<SavedApplication[]> {
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
      const query = database
        .transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .getAll() as IDBRequest<SavedApplication[]>;
      query.onsuccess = () => {
        database.close();
        resolve(query.result);
      };
      query.onerror = () => {
        database.close();
        reject(query.error ?? new Error('Could not read saved applications.'));
      };
    };
  });
}

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <header class="page__header">
      <h1 class="page__title">My Applications</h1>
      <p>Review applications you have saved on this device.</p>
    </header>

    @if (loading()) {
      <p role="status">Loading your applications...</p>
    } @else if (error(); as message) {
      <p class="notice notice--error" role="alert">{{ message }}</p>
    } @else if (applications().length === 0) {
      <section class="empty">
        <h2>No applications yet</h2>
        <p>Find an opening that matches your skills and submit an application.</p>
        <a class="button" routerLink="/jobs">Browse jobs</a>
      </section>
    } @else {
      <p class="notice">
        Applications are stored locally until application uploads are connected to the server.
      </p>
      <div class="applications">
        @for (application of applications(); track application.id) {
          <article class="application">
            <div>
              <h2>{{ application.job?.title ?? 'Job opening no longer available' }}</h2>
              @if (application.job; as job) {
                @if (job.company || job.location) {
                  <p class="meta">{{ job.company }}{{ job.company && job.location ? ' · ' : '' }}{{ job.location }}</p>
                }
              }
              <p class="meta">Applied {{ application.submittedAt | date: 'mediumDate' }}</p>
              <span class="status">{{ application.status || 'Submitted' }}</span>
            </div>
            @if (application.job) {
              <a class="button button--secondary" [routerLink]="['/jobs', application.job.id]">
                View job
              </a>
            }
          </article>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; max-width: 960px; margin: 0 auto; }
    .page__header { margin-bottom: 1.5rem; }
    .page__title { margin: 0 0 0.35rem; color: #172554; font-size: 1.5rem; }
    .page__header p, .meta { color: #64748b; }
    .applications { display: grid; gap: 1rem; }
    .application, .empty {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 1.25rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    }
    .application h2, .empty h2 { margin: 0; color: #172554; font-size: 1.125rem; }
    .meta { margin: 0.4rem 0 0; font-size: 0.9rem; }
    .status {
      display: inline-block; margin-top: 0.8rem; padding: 0.25rem 0.6rem;
      border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 0.8rem;
    }
    .notice { margin: 0 0 1rem; color: #475569; font-size: 0.9rem; }
    .notice--error { color: #b91c1c; }
    .empty { display: block; padding: 2rem; text-align: center; }
    .empty p { color: #64748b; }
    .button {
      display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 1rem;
      border: 0; border-radius: 9px; background: #4f46e5; color: #fff;
      font: inherit; font-weight: 600; text-decoration: none;
    }
    .button--secondary { flex: none; border: 1px solid #4f46e5; background: #fff; color: #4f46e5; }
    @media (max-width: 600px) {
      .application { align-items: flex-start; flex-direction: column; }
    }
  `
})
export class MyApplications {
  private readonly auth = inject(AuthService);
  private readonly jobs = inject(JobService);

  readonly applications = signal<ApplicationRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const user = this.auth.currentUser();
    if (!user || user.role !== 'JobSeeker') {
      this.error.set('Sign in as a jobseeker to view your applications.');
      this.loading.set(false);
      return;
    }

    try {
      const saved = await readApplications();
      const mine = saved
        .filter(
          (application) =>
            application.applicantId === user.id ||
            (!application.applicantId &&
              application.email.toLowerCase() === user.email.toLowerCase())
        )
        .sort(
          (left, right) =>
            new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
        );
      const rows = await Promise.all(
        mine.map(async (application) => ({
          ...application,
          job: await firstValueFrom(this.jobs.getJob(application.jobId))
        }))
      );
      this.applications.set(rows);
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'Could not load your applications.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
