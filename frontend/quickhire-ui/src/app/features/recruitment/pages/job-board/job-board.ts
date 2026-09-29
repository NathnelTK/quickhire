import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { JobService } from '../../data-access/job.service';
import { JobPosting } from '../../models/recruitment.model';
import { ApplicantFormDialog } from '../../components/applicant-form-dialog/applicant-form-dialog';

@Component({
  selector: 'app-job-board',
  imports: [DatePipe, ApplicantFormDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-board.html',
  styleUrl: './job-board.scss'
})
export class JobBoardPage {
  private readonly jobService = inject(JobService);

  protected readonly jobs = signal<JobPosting[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly applyTo = signal<JobPosting | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.jobService.getAll().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  protected trackById(_index: number, job: JobPosting): string {
    return job.id;
  }
}
