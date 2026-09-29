import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/api/api.config';
import { JobPosting } from '../models/recruitment.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private get url(): string {
    return `${this.config.baseUrl}/api/jobs`;
  }

  getAll(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(this.url);
  }

  getOpen(): Observable<JobPosting[]> {
    return this.http.get<JobPosting[]>(`${this.url}/open`);
  }
}
