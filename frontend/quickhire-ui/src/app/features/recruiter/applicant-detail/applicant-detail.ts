import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';

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

function getApplication(applicationId: string): Promise<ApplicantApplication | undefined> {
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
        .get(applicationId) as IDBRequest<ApplicantApplication | undefined>;
      query.onsuccess = () => {
        database.close();
        resolve(query.result);
      };
      query.onerror = () => {
        database.close();
        reject(query.error ?? new Error('Could not read this application.'));
      };
    };
  });
}

@Component({
  selector: 'app-applicant-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './applicant-detail.html',
  styleUrl: './applicant-detail.scss'
})
export class ApplicantDetail implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly jobs = inject(JobService);

  readonly jobId = this.route.snapshot.paramMap.get('id') ?? '';
  readonly application = signal<ApplicantApplication | null>(null);
  readonly jobTitle = signal('');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly resumeUrl = signal('');

  constructor() {
    const applicationId = this.route.snapshot.paramMap.get('applicationId');
    const recruiterId = this.auth.currentUser()?.id;
    if (!applicationId || !recruiterId) {
      this.loading.set(false);
      this.error.set('This application could not be found.');
      return;
    }

    this.jobs.getJob(this.jobId).subscribe({
      next: (job) => {
        if (!job || job.recruiterId !== recruiterId) {
          this.loading.set(false);
          this.error.set('This application could not be found.');
          return;
        }
        this.jobTitle.set(job.title);
        void getApplication(applicationId)
          .then((application) => {
            if (!application || application.jobId !== job.id) {
              this.error.set('This application could not be found.');
              return;
            }
            this.application.set(application);
            if (application.resume) {
              this.resumeUrl.set(URL.createObjectURL(application.resume));
            }
          })
          .catch((error: unknown) => {
            this.error.set(
              error instanceof Error ? error.message : 'Could not load this application.'
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

  ngOnDestroy(): void {
    const url = this.resumeUrl();
    if (url) URL.revokeObjectURL(url);
  }
}
