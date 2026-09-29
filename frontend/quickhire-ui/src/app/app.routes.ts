import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.DashboardPage)
  },
  {
    path: 'employees',
    loadChildren: () => import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ROUTES)
  },
  {
    path: 'departments',
    loadChildren: () =>
      import('./features/departments/departments.routes').then((m) => m.DEPARTMENT_ROUTES)
  },
  {
    path: 'recruitment',
    loadChildren: () =>
      import('./features/recruitment/recruitment.routes').then((m) => m.RECRUITMENT_ROUTES)
  },
  { path: '**', redirectTo: 'dashboard' }
];
