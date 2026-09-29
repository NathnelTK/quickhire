import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Job, JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss',
})
export class Jobs {
  private jobService = inject(JobService);
  private router = inject(Router);

  loading = signal(true);
  error = signal('');
  jobs = signal<Job[]>([]);

  search = signal('');
  location = signal('');
  category = signal('');
  type = signal('');

  types = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  tints = ['#EEF2FF', '#DCFCE7', '#FEF3C7', '#FCE7F3'];
  iconColors = ['#4F46E5', '#16A34A', '#D97706', '#DB2777'];

  locations = computed(() =>
    [...new Set(this.jobs().map((job) => job.location).filter(Boolean))].sort()
  );
  categories = computed(() =>
    [...new Set(this.jobs().map((job) => job.category).filter(Boolean))].sort()
  );

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.jobs().filter(
      (j) =>
        (!q || [j.title, j.company, j.location].some((value) => value.toLowerCase().includes(q))) &&
        (!this.location() || j.location === this.location()) &&
        (!this.category() || j.category === this.category()) &&
        (!this.type() || j.type === this.type()),
    );
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.jobService.getJobs().subscribe({
      next: (list) => {
        this.jobs.set(list);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof Error ? error.message : 'Could not load jobs.');
        this.loading.set(false);
      }
    });
  }

  timeAgo(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days < 1) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  clearFilters(): void {
    this.search.set('');
    this.location.set('');
    this.category.set('');
    this.type.set('');
  }

  openJob(job: Job): void {
    this.router.navigate(['/jobs', job.id]);
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
