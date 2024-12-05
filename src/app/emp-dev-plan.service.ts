import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';

export interface EmpDevPlanCreateDto {
  user_id: UUID;
  plan: string;
  dev_plan_id: UUID;
  plan_detail: string;
  assessment_year: number;
  created_at: Date;
}

@Injectable({
  providedIn: 'root',
})
export class EmpDevPlanService {
  private apiUrl = 'http://localhost:8080/emp-dev-plan'; // Backend API endpoint
  private apiUrl2 = 'http://localhost:8080/emp-dev-plan/user';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpDevPlan(payload: EmpDevPlanCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }

  getEmpDevPlanByUserId(userId: string): Observable<EmpDevPlanCreateDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<EmpDevPlanCreateDto[]>(`${this.apiUrl2}/${userId}/with-plan`, {
        headers,
      })
      .pipe(
        tap((data) => {
          console.log('Data fetched successfully:', data);
        })
      );
  }

  deleteEmpDevPlan(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}
