import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/api/api.config';
import { Applicant, CreateApplicantRequest } from '../models/recruitment.model';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private get jobsUrl(): string {
    return `${this.config.baseUrl}/api/jobs`;
  }

  submit(request: CreateApplicantRequest): Observable<Applicant> {
    return this.http.post<Applicant>(`${this.jobsUrl}/${request.jobPostingId}/applicants`, request);
  }

  getByJob(jobPostingId: string): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(`${this.jobsUrl}/${jobPostingId}/applicants`);
  }

  updateStatus(jobPostingId: string, id: string, status: Applicant['status']): Observable<void> {
    return this.http.patch<void>(`${this.jobsUrl}/${jobPostingId}/applicants/${id}/status`, { status });
  }
}
