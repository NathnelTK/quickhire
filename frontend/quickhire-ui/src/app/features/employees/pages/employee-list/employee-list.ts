import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../data-access/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeFormDialog } from '../../components/employee-form-dialog/employee-form-dialog';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-employee-list',
  imports: [DatePipe, FormsModule, EmployeeFormDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeListPage {
  private readonly employeeService = inject(EmployeeService);
  private readonly toasts = inject(ToastService);

  protected readonly employees = signal<Employee[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly search = signal('');
  protected readonly departmentFilter = signal('all');
  protected readonly dialog = signal<Employee | 'new' | null>(null);

  protected readonly departments = computed(() => {
    const names = new Map<string, string>();
    for (const employee of this.employees()) {
      if (employee.departmentName) {
        names.set(employee.departmentId, employee.departmentName);
      }
    }
    return [...names.entries()].map(([id, name]) => ({ id, name }));
  });

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const departmentId = this.departmentFilter();

    return this.employees().filter((employee) => {
      const matchesDepartment = departmentId === 'all' || employee.departmentId === departmentId;
      if (!matchesDepartment) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        employee.firstName.toLowerCase().includes(term) ||
        employee.lastName.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term)
      );
    });
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      }
    });
  }

  protected remove(employee: Employee): void {
    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.employees.update((list) => list.filter((item) => item.id !== employee.id));
        this.toasts.success(`${employee.firstName} ${employee.lastName} removed.`);
      },
      error: (error: Error) => this.toasts.error(error.message)
    });
  }

  protected trackById(_index: number, employee: Employee): string {
    return employee.id;
  }
}
