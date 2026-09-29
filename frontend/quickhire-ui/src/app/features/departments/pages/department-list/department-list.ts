import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DepartmentService } from '../../data-access/department.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-list',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page__header">
      <h1 class="page__title">Departments</h1>
    </header>

    <form class="department-form" (ngSubmit)="save()">
      <label class="department-form__field">
        <span>{{ editingId() ? 'Department name' : 'New department' }}</span>
        <input
          class="department-form__input"
          name="departmentName"
          [ngModel]="name()"
          (ngModelChange)="name.set($event)"
          maxlength="100"
          required
        />
      </label>
      <button type="submit" class="button button--primary" [disabled]="saving() || !name().trim()">
        {{ saving() ? 'Saving…' : editingId() ? 'Save changes' : 'Add department' }}
      </button>
      @if (editingId()) {
        <button type="button" class="button" (click)="cancelEdit()">Cancel</button>
      }
    </form>

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
          <li class="list__item">
            <div>
              <strong>{{ department.name }}</strong>
              <span class="list__count">{{ department.employeeCount }} employees</span>
            </div>
            <div class="list__actions">
              <button type="button" class="button button--ghost" (click)="edit(department)">Edit</button>
              <button
                type="button"
                class="button button--ghost"
                [disabled]="department.employeeCount > 0"
                [attr.aria-label]="'Delete ' + department.name"
                (click)="remove(department)"
              >Delete</button>
            </div>
          </li>
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
    .department-form {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .department-form__field {
      display: grid;
      gap: 0.25rem;
      min-width: min(100%, 18rem);
      font-size: 0.875rem;
    }
    .department-form__input {
      min-height: 2.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font: inherit;
    }
    .list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
      gap: 0.75rem;
      padding: 0;
      list-style: none;
    }
    .list__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
    }
    .list__count {
      display: block;
      color: #6b7280;
      font-size: 0.875rem;
    }
    .list__actions {
      display: flex;
      flex: 0 0 auto;
      gap: 0.25rem;
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
  protected readonly name = signal('');
  protected readonly editingId = signal<string | null>(null);
  protected readonly saving = signal(false);

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

  protected save(): void {
    const name = this.name().trim();
    if (!name || this.saving()) return;
    this.saving.set(true);
    const request = { name };
    const operation = this.editingId()
      ? this.departmentService.update(this.editingId()!, request)
      : this.departmentService.create(request);
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.cancelEdit();
        this.load();
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.error.set(error.message);
      }
    });
  }

  protected edit(department: Department): void {
    this.editingId.set(department.id);
    this.name.set(department.name);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.name.set('');
  }

  protected remove(department: Department): void {
    this.departmentService.delete(department.id).subscribe({
      next: () => this.load(),
      error: (error: Error) => this.error.set(error.message)
    });
  }
}
