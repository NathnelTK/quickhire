import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { App } from './app';
import { routes } from './app.routes';
import { API_CONFIG } from './core/api/api.config';
import { AuthUser, toRole } from './core/models/auth.model';
import { AuthService } from './core/services/auth.service';
import { Job, JobService } from './core/services/job.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { baseUrl: 'http://localhost:5045' } }
      ]
    }).compileComponents();
    sessionStorage.clear();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
  });

  it('creates the root component', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders only a router outlet at the root', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-shell')).toBeNull();
  });

  it('keeps job browsing public and protects applying and application history', () => {
    const jobRoutes = routes.find((route) => route.children?.some((child) => child.path === 'jobs'));
    const children = jobRoutes?.children ?? [];
    expect(jobRoutes?.canActivate).toBeUndefined();
    expect(children.find((route) => route.path === 'jobs/:id')?.canActivate).toBeUndefined();
    expect(children.find((route) => route.path === 'jobs/:id/apply')?.canActivate).toHaveLength(2);
    expect(children.find((route) => route.path === 'applications')?.canActivate).toHaveLength(2);
  });

  it('protects recruiter and HR routes from other roles', () => {
    const recruiterRoutes = routes.find((route) => route.path === 'recruiter');
    const hrRoutes = routes.find((route) => route.children?.some((child) => child.path === 'dashboard'));
    expect(recruiterRoutes?.canActivate).toHaveLength(2);
    expect(hrRoutes?.canActivate).toHaveLength(2);
  });

  it('normalizes API and legacy role names', () => {
    expect(toRole('JobSeeker')).toBe('JobSeeker');
    expect(toRole('applicant')).toBe('JobSeeker');
    expect(toRole('Recruiter')).toBe('Recruiter');
    expect(toRole('Administrator')).toBe('Administrator');
    expect(toRole('Employee')).toBe('Employee');
  });

  it('loads public jobs from the backend and represents fields it does not provide as empty', () => {
    const jobsService = TestBed.inject(JobService);
    const requestController = TestBed.inject(HttpTestingController);
    let received: Job[] = [];

    jobsService.getJobs().subscribe((jobs) => {
      received = jobs;
    });

    const request = requestController.expectOne('http://localhost:5045/api/jobs');
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: '5a232f42-3c71-4ed1-a02c-b0755161fc10',
        title: 'Frontend Developer',
        description: 'Build the QuickHire frontend.',
        status: 'Open',
        postedAt: '2026-09-28T10:00:00Z'
      }
    ]);

    expect(received).toEqual([
      expect.objectContaining({
        id: '5a232f42-3c71-4ed1-a02c-b0755161fc10',
        title: 'Frontend Developer',
        description: 'Build the QuickHire frontend.',
        status: 'active',
        company: '',
        location: '',
        type: '',
        salaryRange: ''
      })
    ]);
  });

  it('uses the login API token and server role rather than fabricating a local user', () => {
    const auth = TestBed.inject(AuthService);
    const requestController = TestBed.inject(HttpTestingController);
    let result: AuthUser | null = null;
    auth.login('recruiter@example.com', 'password', 'Recruiter').subscribe((user) => {
      result = user;
    });

    const request = requestController.expectOne('http://localhost:5045/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'recruiter@example.com',
      password: 'password'
    });
    const payload = btoa(JSON.stringify({ sub: 'user-guid' }));
    request.flush({
      accessToken: `header.${payload}.signature`,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      name: 'Recruiter User',
      roles: ['Recruiter']
    });

    expect(result).toEqual(
      expect.objectContaining({ id: 'user-guid', role: 'Recruiter', accessToken: `header.${payload}.signature` })
    );
    expect(sessionStorage.getItem('quickhire.session.user')).toContain('user-guid');
    auth.logout();
  });
});
