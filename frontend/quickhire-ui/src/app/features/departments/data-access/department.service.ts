import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/api/api.config';
import { Department } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.config.baseUrl}/api/departments`);
  }
}
