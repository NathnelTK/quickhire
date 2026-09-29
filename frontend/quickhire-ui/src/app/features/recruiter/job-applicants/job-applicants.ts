import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService } from '../../../core/services/job.service';

const DATABASE_NAME = 'quickhire-applications';
const STORE_NAME = 'applications';

interface ApplicantApplication {
  id: string;
  jobId: string;
  applicantId?: string;
  name: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  status?: string;
  submittedAt: string;
  resume?: File;
}

function getApplications(jobId: string): Promise<ApplicantApplication[]> {
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
        resolve(query.result.filter((application) => application.jobId === jobId));
      };
      query.onerror = () => {
        database.close();
        reject(query.error ?? new Error('Could not read job applications.'));
      };
    };
  });
}

@Component({
  selector: 'app-job-applicants',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './job-applicants.html',
  styleUrl: './job-applicants.scss'
})
export class JobApplicants {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly jobService = inject(JobService);

  readonly job = signal<Job | null>(null);
  readonly applicants = signal<ApplicantApplication[]>([]);
  readonly selectedTab = signal<'applicants' | 'details'>('applicants');
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    const jobId = this.route.snapshot.paramMap.get('id');
    const recruiterId = this.auth.currentUser()?.id;
    if (!jobId || !recruiterId) {
      this.loading.set(false);
      this.error.set('This job could not be found.');
      return;
    }

    this.jobService.getJob(jobId).subscribe({
      next: (job) => {
        if (!job || job.recruiterId !== recruiterId) {
          this.loading.set(false);
          this.error.set('This job could not be found.');
          return;
        }

        this.job.set(job);
        void getApplications(jobId)
          .then((applicants) => this.applicants.set(applicants))
          .catch((error: unknown) => {
            this.error.set(
              error instanceof Error
                ? error.message
                : 'Could not load applications for this job.'
            );
          })
          .finally(() => this.loading.set(false));
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(error instanceof Error ? error.message : 'Could not load this job.');
      }
    });
  }

  applicantName(application: ApplicantApplication): string {
    return application.name || application.email;
  }

  applicantStatus(application: ApplicantApplication): string {
    return application.status || 'Received';
  }
}
