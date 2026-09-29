import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService } from '../../../core/services/job.service';

const DATABASE_NAME = 'quickhire-applications';
const STORE_NAME = 'applications';

interface ApplicantApplication {
  id: string;
  jobId: string;
  name: string;
  email: string;
  status?: string;
  submittedAt: string;
}

interface RecruiterApplicant extends ApplicantApplication {
  jobTitle: string;
}

function readApplications(): Promise<ApplicantApplication[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 2);
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
        .getAll() as IDBRequest<ApplicantApplication[]>;
      query.onsuccess = () => {
        database.close();
        resolve(query.result);
      };
      query.onerror = () => {
        database.close();
        reject(query.error ?? new Error('Could not read applications.'));
      };
    };
  });
}

@Component({
  selector: 'app-recruiter-applicants',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './applicants.html',
  styleUrl: './applicants.scss'
})
export class Applicants {
  private readonly auth = inject(AuthService);
  private readonly jobsService = inject(JobService);

  readonly applicants = signal<RecruiterApplicant[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    const recruiterId = this.auth.currentUser()?.id;
    if (!recruiterId) {
      this.loading.set(false);
      this.error.set('Sign in as a recruiter to view applicants.');
      return;
    }

    this.jobsService.getRecruiterJobs(recruiterId).subscribe({
      next: (jobs) => {
        void this.loadApplicants(jobs);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(error instanceof Error ? error.message : 'Could not load your jobs.');
      }
    });
  }

  private async loadApplicants(jobs: Job[]): Promise<void> {
    try {
      const applications = await readApplications();
      const ownedJobs = new Map(jobs.map((job) => [job.id, job]));
      this.applicants.set(
        applications
          .filter((application) => ownedJobs.has(application.jobId))
          .map((application) => ({
            ...application,
            jobTitle: ownedJobs.get(application.jobId)?.title ?? ''
          }))
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      );
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Could not load applicants.');
    } finally {
      this.loading.set(false);
    }
  }
}
