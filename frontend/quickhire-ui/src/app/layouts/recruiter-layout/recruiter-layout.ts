import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recruiter-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './recruiter-layout.html',
  styleUrl: '../applicant-layout/applicant-layout.scss',
})
export class RecruiterLayout {
  private auth = inject(AuthService);
  private router = inject(Router);

  open = signal(false);

  get userName(): string {
    return this.auth.currentUser()?.name ?? 'Guest';
  }

  get initials(): string {
    return this.userName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
