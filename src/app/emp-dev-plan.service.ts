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
  status: string;
  created_at: Date;
}

@Injectable({
  providedIn: 'root',
})
export class EmpDevPlanService {
  private apiUrl = 'http://localhost:8080/emp-dev-plan';
  private apiUrl2 = 'http://localhost:8080/emp-dev-plan/user';
  private apiUrl3 = 'http://localhost:8080/dev-plan';
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

  getAllDevPlan(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<any[]>(`${this.apiUrl3}`, { headers });
  }

  getEmpDevPlanByUserIdAndYear(
    userId: string,
    assessmentYear: number
  ): Observable<EmpDevPlanCreateDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http.get<EmpDevPlanCreateDto[]>(
      `${this.apiUrl}/getByUserIdAndYear?userId=${userId}&assessmentYear=${assessmentYear}`,
      { headers }
    );
  }

  getAssessmentYears(): Observable<number[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<number[]>(`${this.apiUrl}/assessment-years`, { headers })
      .pipe(
        tap((years) => {
          console.log('Retrieved assessment years:', years);
        })
      );
  }
}
