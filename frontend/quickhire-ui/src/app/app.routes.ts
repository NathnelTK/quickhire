import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.Register)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/applicant-layout/applicant-layout').then((m) => m.ApplicantLayout),
    children: [
      {
        path: 'jobs/:id/apply',
        canActivate: [authGuard, roleGuard('JobSeeker')],
        loadComponent: () =>
          import('./features/applicant/job-application/job-application').then(
            (m) => m.JobApplication
          )
      },
      {
        path: 'jobs/:id',
        loadComponent: () =>
          import('./features/applicant/job-details/job-details').then((m) => m.JobDetails)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/applicant/jobs/jobs').then((m) => m.Jobs),
      },
      {
        path: 'applications',
        canActivate: [authGuard, roleGuard('JobSeeker')],
        loadComponent: () =>
          import('./features/applicant/my-applications/my-applications').then(
            (m) => m.MyApplications
          )
      },
    ],
  },
  {
    path: 'recruiter',
    canActivate: [authGuard, roleGuard('Recruiter', 'Administrator')],
    loadComponent: () =>
      import('./layouts/recruiter-layout/recruiter-layout').then((m) => m.RecruiterLayout),
    children: [
      {
        path: 'applicants',
        loadComponent: () =>
          import('./features/recruiter/applicants/applicants').then((m) => m.Applicants)
      },
      {
        path: 'jobs/:id/applicants/:applicationId',
        loadComponent: () =>
          import('./features/recruiter/applicant-detail/applicant-detail').then(
            (m) => m.ApplicantDetail
          )
      },
      {
        path: 'jobs/:id/applicants',
        loadComponent: () =>
          import('./features/recruiter/job-applicants/job-applicants').then(
            (m) => m.JobApplicants
          )
      },
      {
        path: 'jobs/:id/edit',
        loadComponent: () =>
          import('./features/recruiter/edit-job/edit-job').then((m) => m.EditJob)
      },
      {
        path: 'post-job',
        loadComponent: () =>
          import('./features/recruiter/post-job/post-job').then((m) => m.PostJob),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/recruiter/my-jobs/my-jobs').then((m) => m.MyJobs)
      },
      { path: '', redirectTo: 'post-job', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard, roleGuard('Recruiter', 'Administrator')],
    loadComponent: () =>
      import('./core/layout/shell-layout/shell-layout').then((m) => m.ShellLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.DashboardPage)
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes').then((m) => m.EMPLOYEE_ROUTES)
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
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: '' }
];
