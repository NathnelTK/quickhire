import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { DepartmentService } from '../../data-access/department.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page__header">
      <h1 class="page__title">Departments</h1>
    </header>

    @if (loading()) {
      <p class="state">Loading departments…</p>
    } @else if (error(); as message) {
      <div class="state state--error">
        <p>{{ message }}</p>
        <button type="button" class="button" (click)="load()">Retry</button>
      </div>
    } @else if (departments().length === 0) {
      <p class="state">No departments yet.</p>
    } @else {
      <ul class="list">
        @for (department of departments(); track department.id) {
          <li class="list__item">{{ department.name }}</li>
        }
      </ul>
    }
  `,
  styles: `
    .page__title {
      margin: 0;
      font-size: 1.5rem;
    }
    .page__header {
      margin-bottom: 1.25rem;
    }
    .list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
      gap: 0.75rem;
      padding: 0;
      list-style: none;
    }
    .list__item {
      padding: 1rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      font-weight: 500;
    }
    .state {
      padding: 1.5rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      color: #4b5563;
      text-align: center;
    }
    .state--error {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fef2f2;
    }
  `
})
export class DepartmentListPage {
  private readonly departmentService = inject(DepartmentService);

  protected readonly departments = signal<Department[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments.set(departments);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }
}
