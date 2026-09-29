import { NgFor } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ToastContainer } from '../../../shared/components/toast-container/toast-container';
import { AuthService } from '../../../features/auth/data-access/auth.service';

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

  protected readonly navItems = computed(() => {
    const items: NavItem[] = [{ label: 'Find jobs', path: '/jobs' }];
    if (this.auth.hasAnyRole(['Administrator', 'Recruiter', 'Employee'])) {
      items.unshift({ label: 'Dashboard', path: '/dashboard' });
    }
    if (this.auth.hasAnyRole(['Administrator', 'Recruiter'])) {
      items.push(
        { label: 'Employees', path: '/employees' },
        { label: 'Departments', path: '/departments' },
        { label: 'Recruiter workspace', path: '/recruiter' }
      );
    }
    return items;
  });

  protected get signedIn(): boolean {
    return this.auth.isAuthenticated;
  }

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/jobs');
  }
}
