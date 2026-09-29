import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, delay } from 'rxjs';

import { API_CONFIG } from '../api/api.config';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | '';

interface JobPostingResponse {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Closed';
  postedAt: string;
}

export interface Job {
  id: string;
  recruiterId?: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryRange: string;
  description: string;
  requirements: string[];
  postedAt: string; // ISO date
  status: 'active' | 'closed';
  category: string;
}

const KEY = 'qh_jobs';
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const SEED: Job[] = [
  {
    id: 'job-1', title: 'Frontend Developer', company: 'Acme Inc.', location: 'Remote',
    type: 'Full-time', salaryRange: '$60k - $90k', category: 'Engineering', status: 'active',
    postedAt: daysAgo(2),
    description: 'We are looking for a skilled Frontend Developer to join our team. You will build modern web applications using Angular and work closely with our design and backend teams.',
    requirements: ['3+ years of frontend development experience', 'Proficiency in Angular', 'Good understanding of responsive design', 'Experience with TypeScript'],
  },
  {
    id: 'job-2', title: 'Backend Developer', company: 'TechCorp', location: 'New York, NY',
    type: 'Full-time', salaryRange: '$70k - $100k', category: 'Engineering', status: 'active',
    postedAt: daysAgo(3),
    description: 'Join our platform team to design and build reliable REST APIs and services.',
    requirements: ['Experience with REST APIs', 'Solid database knowledge', 'Comfortable with Git and code review'],
  },
  {
    id: 'job-3', title: 'UI/UX Designer', company: 'DesignStudio', location: 'Remote',
    type: 'Full-time', salaryRange: '$50k - $80k', category: 'Design', status: 'active',
    postedAt: daysAgo(4),
    description: 'Design clean, user-friendly interfaces for web and mobile products.',
    requirements: ['Strong portfolio', 'Experience with Figma', 'Understanding of design systems'],
  },
  {
    id: 'job-4', title: 'Software Engineer', company: 'InnovateLabs', location: 'San Francisco, CA',
    type: 'Full-time', salaryRange: '$80k - $120k', category: 'Engineering', status: 'active',
    postedAt: daysAgo(5),
    description: 'Build and ship features across our product with a small, fast-moving team.',
    requirements: ['Strong computer science fundamentals', 'Experience with a modern web stack', 'Good communication'],
  },
];

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private read(): Job[] {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as Job[];
    } catch {
      /* ignore and reseed */
    }
    localStorage.setItem(KEY, JSON.stringify(SEED));
    return [...SEED];
  }

  private write(jobs: Job[]): void {
    localStorage.setItem(KEY, JSON.stringify(jobs));
  }

  getJobs(): Observable<Job[]> {
    return this.http
      .get<JobPostingResponse[]>(`${this.config.baseUrl}/api/jobs`)
      .pipe(
        map((jobs) => {
          if (!Array.isArray(jobs)) {
            throw new Error('The jobs API returned an invalid response.');
          }
          return jobs.map((job) => this.fromApi(job));
        }),
        map((jobs) =>
          jobs.sort(
            (left, right) =>
              new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime()
          )
        )
      );
  }

  getJob(id: string): Observable<Job | undefined> {
    return this.getJobs().pipe(map((jobs) => jobs.find((job) => job.id === id)));
  }

  getRecruiterJobs(recruiterId: string): Observable<Job[]> {
    const jobs = this.read()
      .filter((job) => job.recruiterId === recruiterId)
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    return of(jobs).pipe(delay(300));
  }

  /** Future: POST /api/jobs (used by the recruiter Post a Job page) */
  addJob(data: Omit<Job, 'id' | 'postedAt' | 'status'>): Observable<Job> {
    const job: Job = {
      ...data,
      id: 'job-' + Date.now(),
      postedAt: new Date().toISOString(),
      status: 'active',
    };
    this.write([job, ...this.read()]);
    return of(job).pipe(delay(500));
  }

  updateRecruiterJob(
    id: string,
    recruiterId: string,
    updates: Omit<Job, 'id' | 'recruiterId' | 'postedAt'>
  ): Observable<Job | undefined> {
    const jobs = this.read();
    const index = jobs.findIndex((job) => job.id === id && job.recruiterId === recruiterId);
    if (index === -1) return of(undefined).pipe(delay(300));

    const updated = { ...jobs[index], ...updates };
    jobs[index] = updated;
    this.write(jobs);
    return of(updated).pipe(delay(300));
  }

  private fromApi(job: JobPostingResponse): Job {
    if (!job.id || !job.title || !job.description || !job.postedAt) {
      throw new Error('The jobs API returned a posting with missing required fields.');
    }

    const status = job.status.toLowerCase();
    if (status !== 'open' && status !== 'closed') {
      throw new Error(`The jobs API returned an unsupported status: ${job.status}.`);
    }

    return {
      id: job.id,
      title: job.title,
      company: '',
      location: '',
      type: '',
      salaryRange: '',
      description: job.description,
      requirements: [],
      postedAt: job.postedAt,
      status: status === 'open' ? 'active' : 'closed',
      category: ''
    };
  }
}
