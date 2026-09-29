import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ToastContainer } from '../../../shared/components/toast-container/toast-container';

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
  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Employees', path: '/employees' },
    { label: 'Departments', path: '/departments' },
    { label: 'Recruitment', path: '/recruitment' }
  ];
}
