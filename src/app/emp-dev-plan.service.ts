import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';

export interface EmpDevPlanCreateDto {
  user_id: UUID;
  dev_plan_id: UUID;
  plan_detail: string;
  assessment_year: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmpDevPlanService {
  private apiUrl = 'http://localhost:8080/emp-dev-plan'; // Backend API endpoint
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpDevPlan(payload: EmpDevPlanCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }
}
