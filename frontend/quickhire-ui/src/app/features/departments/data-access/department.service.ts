import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/api/api.config';
import { Department, DepartmentRequest } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.config.baseUrl}/api/departments`);
  }

  create(request: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(`${this.config.baseUrl}/api/departments`, request);
  }

  update(id: string, request: DepartmentRequest): Observable<Department> {
    return this.http.put<Department>(`${this.config.baseUrl}/api/departments/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.baseUrl}/api/departments/${id}`);
  }
}
