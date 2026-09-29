import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Job, JobService } from '../../../core/services/job.service';

const SAVED_KEY = 'qh_saved';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './job-details.html',
  styleUrl: './job-details.scss',
})
export class JobDetails {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private auth = inject(AuthService);

  loading = signal(true);
  error = signal('');
  job = signal<Job | undefined>(undefined);
  saved = signal(false);
  readonly currentUser = this.auth.currentUser;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id') ?? '';
      this.loadJob(id);
    });
  }

  loadJob(id = this.route.snapshot.paramMap.get('id') ?? ''): void {
    this.error.set('');
    this.job.set(undefined);
    this.loading.set(true);
    this.jobService.getJob(id).subscribe({
      next: (job) => {
        this.job.set(job);
        this.saved.set(this.readSaved().includes(id));
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof Error ? error.message : 'Could not load this job.');
        this.loading.set(false);
      }
    });
  }

  private readSaved(): string[] {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  }

  toggleSave(): void {
    const j = this.job();
    if (!j) return;
    const list = this.readSaved();
    const next = list.includes(j.id) ? list.filter((x) => x !== j.id) : [...list, j.id];
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    this.saved.set(next.includes(j.id));
  }

  timeAgo(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days < 1) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }
}