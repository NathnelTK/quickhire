export type UserRole = 'Recruiter' | 'JobSeeker' | 'Employee' | 'Administrator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  company?: string;
  expiresAt?: number;
}

export const ROLE_LANDING_PATH: Record<UserRole, string> = {
  JobSeeker: '/jobs',
  Employee: '/jobs',
  Recruiter: '/recruiter/post-job',
  Administrator: '/dashboard'
};

export function toRole(value: string | null | undefined): UserRole {
  switch (value?.toLowerCase()) {
    case 'recruiter':
      return 'Recruiter';
    case 'administrator':
    case 'admin':
      return 'Administrator';
    case 'employee':
      return 'Employee';
    case 'jobseeker':
    case 'job-seeker':
    case 'applicant':
      return 'JobSeeker';
    default:
      return 'JobSeeker';
  }
}
