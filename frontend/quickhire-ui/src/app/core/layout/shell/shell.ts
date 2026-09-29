import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ToastContainer } from '../../../shared/components/toast-container/toast-container';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-shell',
  imports: [NgFor, RouterLink, RouterLinkActive, ToastContainer],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employees', path: '/employees' },
    { label: 'Departments', path: '/departments' },
    { label: 'Recruitment', path: '/recruitment' },
    { label: 'Post a Job', path: '/recruiter/post-job' },
    { label: 'My Jobs', path: '/recruiter/jobs' },
    { label: 'Applicants', path: '/recruiter/applicants' }
  ];

  protected readonly user = this.auth.currentUser;

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
