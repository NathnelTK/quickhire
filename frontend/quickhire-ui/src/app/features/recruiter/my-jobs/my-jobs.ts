import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService } from '../../../core/services/job.service';

const APPLICATIONS_DATABASE = 'quickhire-applications';
const APPLICATIONS_STORE = 'applications';

function readApplicantCounts(): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(APPLICATIONS_DATABASE, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(APPLICATIONS_STORE)) {
        request.result.createObjectStore(APPLICATIONS_STORE, { keyPath: 'id' });
      }
    };
    request.onerror = () =>
      reject(request.error ?? new Error('Could not open application storage.'));
    request.onsuccess = () => {
      const database = request.result;
      const query = database
        .transaction(APPLICATIONS_STORE, 'readonly')
        .objectStore(APPLICATIONS_STORE)
        .getAll() as IDBRequest<Array<{ jobId: string }>>;
      query.onsuccess = () => {
        database.close();
        const counts = new Map<string, number>();
        for (const application of query.result) {
          counts.set(application.jobId, (counts.get(application.jobId) ?? 0) + 1);
        }
        resolve(counts);
      };
      query.onerror = () => {
        database.close();
        reject(query.error ?? new Error('Could not read applications.'));
      };
    };
  });
}

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-jobs.html',
  styleUrl: './my-jobs.scss'
})
export class MyJobs {
  private readonly auth = inject(AuthService);
  private readonly jobsService = inject(JobService);

  readonly jobs = signal<Job[]>([]);
  readonly applicantCounts = signal<Map<string, number>>(new Map());
  readonly selectedStatus = signal<Job['status']>('active');
  readonly loading = signal(true);
  readonly error = signal('');

  readonly filteredJobs = computed(() =>
    this.jobs().filter((job) => job.status === this.selectedStatus())
  );
  readonly activeCount = computed(() => this.jobs().filter((job) => job.status === 'active').length);
  readonly closedCount = computed(() => this.jobs().filter((job) => job.status === 'closed').length);

  constructor() {
    const recruiterId = this.auth.currentUser()?.id;
    if (!recruiterId) {
      this.loading.set(false);
      this.error.set('Sign in as a recruiter to view your jobs.');
      return;
    }

    this.jobsService.getRecruiterJobs(recruiterId).subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
        void readApplicantCounts()
          .then((counts) => this.applicantCounts.set(counts))
          .catch((error: unknown) => {
            this.error.set(
              error instanceof Error
                ? `Could not load applicant counts: ${error.message}`
                : 'Could not load applicant counts.'
            );
          });
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(
          error instanceof Error ? error.message : 'Could not load your jobs.'
        );
      }
    });
  }
}
