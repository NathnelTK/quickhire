import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DepartmentService } from '../../../departments/data-access/department.service';
import { Department } from '../../../departments/models/department.model';
import { EmployeeService } from '../../data-access/employee.service';
import { Employee } from '../../models/employee.model';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-employee-form-dialog',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-form-dialog.html',
  styleUrl: './employee-form-dialog.scss'
})
export class EmployeeFormDialog {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly toasts = inject(ToastService);

  readonly target = input<Employee | 'new' | null>(null);
  readonly closed = output<void>();

  protected readonly departments = signal<Department[]>([]);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    dateHired: ['', Validators.required],
    departmentId: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const current = this.target();
      if (current) {
        this.reset(current);
      }
    });

    this.departmentService.getAll().subscribe({
      next: (departments) => this.departments.set(departments),
      error: () => this.toasts.error('Could not load departments.')
    });
  }

  protected get isOpen(): boolean {
    return this.target() !== null;
  }

  protected get heading(): string {
    return this.target() === 'new' ? 'Add employee' : 'Edit employee';
  }

  protected control(name: keyof typeof this.form.controls) {
    return this.form.controls[name];
  }

  protected isInvalid(name: keyof typeof this.form.controls): boolean {
    const control = this.control(name);
    return control.invalid && (control.dirty || control.touched);
  }

  protected submit(): void {
    const current = this.target();
    if (this.form.invalid || current === null) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set(null);

    const result =
      current === 'new'
        ? this.employeeService.create(request)
        : this.employeeService.update(current.id, request);

    result.subscribe({
      next: () => {
        this.saving.set(false);
        this.toasts.success(`Employee ${request.firstName} saved.`);
        this.closed.emit();
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.formError.set(error.message);
      }
    });
  }

  private reset(target: Employee | 'new'): void {
    this.formError.set(null);
    if (target === 'new') {
      this.form.reset({ firstName: '', lastName: '', email: '', dateHired: '', departmentId: '' });
      return;
    }
    this.form.reset({
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      dateHired: target.dateHired?.slice(0, 10) ?? '',
      departmentId: target.departmentId
    });
  }
}
