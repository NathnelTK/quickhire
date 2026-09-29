import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { EmployeeService } from '../../../employees/data-access/employee.service';
import { JobService } from '../../../recruitment/data-access/job.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page__header">
      <h1 class="page__title">Dashboard</h1>
    </header>

    <div class="stats">
      <article class="stat">
        <span class="stat__label">Employees</span>
        <span class="stat__value">{{ employeeCount() }}</span>
      </article>

      <article class="stat">
        <span class="stat__label">Open roles</span>
        <span class="stat__value">{{ openJobCount() }}</span>
      </article>
    </div>

    @if (error(); as message) {
      <p class="notice">{{ message }}</p>
    }
  `,
  styles: `
    .page__header {
      margin-bottom: 1.25rem;
    }
    .page__title {
      margin: 0;
      font-size: 1.5rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 1rem;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1.25rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.625rem;
    }
    .stat__label {
      color: #6b7280;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stat__value {
      font-size: 2rem;
      font-weight: 600;
    }
    .notice {
      margin-top: 1.5rem;
      padding: 0.875rem 1rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 0.5rem;
      color: #92400e;
    }
  `
})
export class DashboardPage {
  private readonly employeeService = inject(EmployeeService);
  private readonly jobService = inject(JobService);

  protected readonly employeeCount = signal(0);
  protected readonly openJobCount = signal(0);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.employeeService.getAll().subscribe({
      next: (employees) => this.employeeCount.set(employees.length),
      error: () => this.error.set('Employee service is not reachable yet.')
    });

    this.jobService.getAll().subscribe({
      next: (jobs) => this.openJobCount.set(jobs.filter((job) => job.status === 'Open').length),
      error: () => this.error.set('Job service is not reachable yet.')
    });
  }
}
