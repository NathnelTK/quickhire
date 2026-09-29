import { Routes } from '@angular/router';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/department-list/department-list').then((m) => m.DepartmentListPage)
  }
];