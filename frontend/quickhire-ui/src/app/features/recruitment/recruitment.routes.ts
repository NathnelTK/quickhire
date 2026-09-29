import { Routes } from '@angular/router';

export const RECRUITMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/job-board/job-board').then((m) => m.JobBoardPage)
  }
];
