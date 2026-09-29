import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApplicantService } from '../../data-access/applicant.service';
import { CreateJobRequest, JobService } from '../../data-access/job.service';
import { Applicant, ApplicantStatus, JobPosting } from '../../models/recruitment.model';

@Component({
  selector: 'app-recruiter-workspace',
  imports: [DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="workspace__header">
      <div>
        <p class="workspace__eyebrow">RECRUITER / WORKSPACE</p>
        <h1>Hiring pipeline</h1>
      </div>
      <button class="button button--primary" type="button" (click)="showForm.set(!showForm())">
        {{ showForm() ? 'Cancel' : 'Post a role' }}
      </button>
    </header>

    @if (showForm()) {
      <form class="job-form" (ngSubmit)="createJob()">
        <label class="field"><span class="field__label">Job title</span>
          <input class="field__input" name="title" [ngModel]="title()" (ngModelChange)="title.set($event)" maxlength="200" required />
        </label>
        <label class="field"><span class="field__label">Description</span>
          <textarea class="field__input" name="description" rows="4" [ngModel]="description()" (ngModelChange)="description.set($event)" maxlength="10000" required></textarea>
        </label>
        <button class="button button--primary" type="submit" [disabled]="saving()">
          {{ saving() ? 'Publishing…' : 'Publish role' }}
        </button>
      </form>
    }

    @if (error(); as message) { <p class="workspace__error" role="alert">{{ message }}</p> }

    <div class="workspace__grid">
      <section class="roles" aria-labelledby="roles-heading">
        <div class="section-heading"><h2 id="roles-heading">Roles</h2><span>{{ jobs().length }}</span></div>
        @if (loading()) { <p class="state">Loading roles…</p> }
        @else if (jobs().length === 0) { <p class="state">No roles posted yet.</p> }
        @else {
          <ul class="role-list">
            @for (job of jobs(); track job.id) {
              <li>
                <button class="role" type="button" [class.role--selected]="selected()?.id === job.id" (click)="select(job)">
                  <span class="role__title">{{ job.title }}</span>
                  <span class="role__meta">{{ job.postedAt | date: 'mediumDate' }} · {{ job.status }}</span>
                </button>
                <button class="role__toggle" type="button" (click)="toggleStatus(job)">{{ job.status === 'Open' ? 'Close' : 'Reopen' }}</button>
              </li>
            }
          </ul>
        }
      </section>

      <section class="applicants" aria-labelledby="applicants-heading">
        <div class="section-heading"><h2 id="applicants-heading">Applicants</h2><span>{{ applicants().length }}</span></div>
        @if (!selected()) { <p class="state">Select a role to review its applicants.</p> }
        @else if (applicantsLoading()) { <p class="state">Loading applicants…</p> }
        @else if (applicants().length === 0) { <p class="state">No applications for {{ selected()?.title }}.</p> }
        @else {
          <div class="applicant-list">
            @for (applicant of applicants(); track applicant.id) {
              <article class="applicant">
                <div class="applicant__identity">
                  <strong>{{ applicant.firstName }} {{ applicant.lastName }}</strong>
                  <a [href]="'mailto:' + applicant.email">{{ applicant.email }}</a>
                  <span>Applied {{ applicant.appliedAt | date: 'mediumDate' }}</span>
                </div>
                <label class="applicant__status">
                  <span class="visually-hidden">Status for {{ applicant.firstName }} {{ applicant.lastName }}</span>
                  <select class="field__input" [ngModel]="applicant.status" (ngModelChange)="updateApplicant(applicant, $event)">
                    @for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }
                  </select>
                </label>
              </article>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    :host { display: block; }
    .workspace__header { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.25rem; }
    .workspace__eyebrow { margin:0 0 .25rem; color:#147d72; font-size:.72rem; font-weight:700; }
    h1 { margin:0; font-family:Georgia,'Times New Roman',serif; font-size:2rem; }
    .workspace__grid { display:grid; grid-template-columns:minmax(17rem,.8fr) minmax(24rem,1.2fr); gap:1rem; align-items:start; }
    .roles,.applicants { min-width:0; border-top:2px solid #263f40; }
    .section-heading { display:flex; align-items:center; justify-content:space-between; padding:.75rem 0; border-bottom:1px solid #d7dedb; }
    .section-heading h2 { margin:0; font-size:1rem; }
    .section-heading span { color:#59656a; font-size:.85rem; }
    .role-list { display:grid; gap:.5rem; padding:0; margin:.75rem 0; list-style:none; }
    .role-list li { display:flex; gap:.35rem; align-items:stretch; }
    .role { display:grid; gap:.25rem; flex:1; min-width:0; padding:.75rem; text-align:left; border:1px solid #d7dedb; border-radius:.25rem; background:#fff; color:#172829; cursor:pointer; }
    .role--selected { border-color:#147d72; box-shadow:inset 3px 0 #147d72; }
    .role__title { font-weight:650; overflow-wrap:anywhere; }
    .role__meta { color:#59656a; font-size:.8rem; }
    .role__toggle { align-self:center; padding:.45rem .55rem; border:0; background:transparent; color:#175f59; font:inherit; cursor:pointer; }
    .applicant-list { display:grid; }
    .applicant { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.85rem 0; border-bottom:1px solid #d7dedb; }
    .applicant__identity { display:grid; gap:.15rem; min-width:0; }
    .applicant__identity a { color:#175f59; overflow-wrap:anywhere; }
    .applicant__identity span { color:#59656a; font-size:.8rem; }
    .applicant__status { width:9rem; flex:0 0 auto; }
    .job-form { display:grid; gap:.8rem; max-width:42rem; margin-bottom:1.25rem; padding:1rem; border:1px solid #d7dedb; border-radius:.25rem; background:#fff; }
    .workspace__error { color:#a21d25; }
    .state { color:#59656a; }
    .visually-hidden { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    @media(max-width:52rem) { .workspace__grid { grid-template-columns:1fr; } .applicant { align-items:flex-start; flex-direction:column; } .applicant__status { width:min(100%,16rem); } }
    @media(max-width:36rem) { .workspace__header { align-items:flex-start; flex-direction:column; } h1 { font-size:1.7rem; } }
  `
})
export class RecruiterWorkspacePage {
  private readonly jobsService = inject(JobService);
  private readonly applicantService = inject(ApplicantService);

  protected readonly jobs = signal<JobPosting[]>([]);
  protected readonly applicants = signal<Applicant[]>([]);
  protected readonly selected = signal<JobPosting | null>(null);
  protected readonly loading = signal(true);
  protected readonly applicantsLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly statuses: ApplicantStatus[] = ['Received', 'Interviewing', 'Hired', 'Rejected'];

  constructor() { this.loadJobs(); }

  protected loadJobs(): void {
    this.loading.set(true);
    this.jobsService.getManage().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.loading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.loading.set(false); }
    });
  }

  protected select(job: JobPosting): void {
    this.selected.set(job);
    this.applicantsLoading.set(true);
    this.applicantService.getByJob(job.id).subscribe({
      next: (applicants) => { this.applicants.set(applicants); this.applicantsLoading.set(false); },
      error: (error: Error) => { this.error.set(error.message); this.applicantsLoading.set(false); }
    });
  }

  protected createJob(): void {
    const request: CreateJobRequest = { title: this.title().trim(), description: this.description().trim() };
    if (!request.title || !request.description || this.saving()) return;
    this.saving.set(true);
    this.jobsService.create(request).subscribe({
      next: () => { this.title.set(''); this.description.set(''); this.showForm.set(false); this.saving.set(false); this.loadJobs(); },
      error: (error: Error) => { this.error.set(error.message); this.saving.set(false); }
    });
  }

  protected toggleStatus(job: JobPosting): void {
    this.jobsService.updateStatus(job.id, job.status === 'Open' ? 'Closed' : 'Open').subscribe({
      next: () => this.loadJobs(),
      error: (error: Error) => this.error.set(error.message)
    });
  }

  protected updateApplicant(applicant: Applicant, status: ApplicantStatus): void {
    const job = this.selected();
    if (!job) return;
    this.applicantService.updateStatus(job.id, applicant.id, status).subscribe({
      next: () => this.applicants.update((items) => items.map((item) => item.id === applicant.id ? { ...item, status } : item)),
      error: (error: Error) => this.error.set(error.message)
    });
  }
}