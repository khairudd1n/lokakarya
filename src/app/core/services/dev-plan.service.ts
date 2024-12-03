import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';

export interface DevPlanDto {
  id: UUID;
  plan: string;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class DevPlanService {
  private apiUrl = 'http://localhost:8080/dev-plan';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getAllDevPlan(): Observable<DevPlanDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<DevPlanDto[]>(`${this.apiUrl}`, { headers })
      .pipe(tap((data) => console.log('Fetched Dev Plan:', data)));
  }

  getAllEmpDevPlan(): Observable<DevPlanDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<DevPlanDto[]>(`${this.apiUrl}`, { headers })
      .pipe(tap((data) => console.log('Fetched Emp Dev Plan:', data)));
  }

  createDevPlan(data: Partial<DevPlanDto>): Observable<DevPlanDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http.post<DevPlanDto>(`${this.apiUrl}`, data, {
      headers,
    });
  }

  updateDevPlan(id: UUID, data: Partial<DevPlanDto>): Observable<DevPlanDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http
      .put<DevPlanDto>(`${this.apiUrl}/${id}`, data, { headers })
      .pipe(
        tap((updatedData) => console.log('Updated Dev Plan:', updatedData))
      );
  }

  deleteDevPlan(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Dev Plan with ID: ${id}`)));
  }
}
