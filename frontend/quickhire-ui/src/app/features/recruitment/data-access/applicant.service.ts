import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/api/api.config';
import { Applicant, CreateApplicantRequest } from '../models/recruitment.model';

@Injectable({ providedIn: 'root' })
export class ApplicantService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private get url(): string {
    return `${this.config.baseUrl}/api/applicants`;
  }

  submit(request: CreateApplicantRequest): Observable<Applicant> {
    return this.http.post<Applicant>(this.url, request);
  }

  getByJob(jobPostingId: string): Observable<Applicant[]> {
    return this.http.get<Applicant[]>(`${this.url}?jobPostingId=${jobPostingId}`);
  }

  updateStatus(id: string, status: Applicant['status']): Observable<Applicant> {
    return this.http.patch<Applicant>(`${this.url}/${id}/status`, { status });
  }
}
