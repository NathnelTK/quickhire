import { Routes } from '@angular/router';
import { authGuard } from './core/security/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'jobs' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { roles: ['Administrator', 'Recruiter', 'Employee'] },
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.DashboardPage)
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    data: { roles: ['Administrator', 'Recruiter'] },
    loadChildren: () => import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ROUTES)
  },
  {
    path: 'departments',
    canActivate: [authGuard],
    data: { roles: ['Administrator', 'Recruiter'] },
    loadChildren: () =>
      import('./features/departments/departments.routes').then((m) => m.DEPARTMENT_ROUTES)
  },
  {
    path: 'jobs',
    loadComponent: () => import('./features/recruitment/pages/job-board/job-board').then((m) => m.JobBoardPage)
  },
  {
    path: 'recruiter',
    canActivate: [authGuard],
    data: { roles: ['Administrator', 'Recruiter'] },
    loadComponent: () => import('./features/recruitment/pages/recruiter-workspace/recruiter-workspace').then((m) => m.RecruiterWorkspacePage)
  },
  { path: 'recruitment', pathMatch: 'full', redirectTo: 'jobs' },
  { path: '**', redirectTo: 'jobs' }
];
