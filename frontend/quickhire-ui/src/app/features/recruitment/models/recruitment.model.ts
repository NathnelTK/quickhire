export type JobStatus = 'Open' | 'Closed';

export type ApplicantStatus = 'Received' | 'Interviewing' | 'Hired' | 'Rejected';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  postedAt: string;
  applicantCount?: number;
}

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  appliedAt: string;
  status: ApplicantStatus;
  jobPostingId: string;
}

export interface CreateApplicantRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobPostingId: string;
}
