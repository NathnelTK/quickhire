import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-applicant-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './applicant-layout.html',
  styleUrl: './applicant-layout.scss',
})
export class ApplicantLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly open = signal(false);
  readonly currentUser = this.auth.currentUser;

  get userName(): string {
    return this.currentUser()?.name ?? 'Guest';
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
    void this.router.navigate(['/']);
  }
}
