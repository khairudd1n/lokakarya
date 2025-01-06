import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';
import { ApiResponse } from './core/models/api-response.model';
import { map } from 'rxjs/operators';

export interface EmpSuggestDto {
  id: UUID;
  user_id: UUID;
  suggestion: string;
  assessment_year: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmpSuggestService {
  private apiUrl = 'http://localhost:8080/emp-suggest';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpSuggest(payload: EmpSuggestDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(`${this.apiUrl}/create`, payload, { headers })
      .pipe(tap((data) => {}));
  }

  updateEmpSuggest(
    payload: {
      id: string;
      user_id: string;
      suggestion: string;
      assessment_year: number;
    }[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put(`${this.apiUrl}`, payload, {
        headers,
      })
      .pipe(tap((updatedSuggests) => {}));
  }

  getEmpSuggestByUserId(userId: string): Observable<EmpSuggestDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<ApiResponse<EmpSuggestDto[]>>(`${this.apiUrl}/user/${userId}`, {
        headers,
      })
      .pipe(map((response) => response.content));
  }

  getEmpSuggestByUserIdAndYear(
    userId: string,
    assessmentYear: number
  ): Observable<EmpSuggestDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<EmpSuggestDto[]>(
      `${this.apiUrl}/userId&Year?userId=${userId}&assessmentYear=${assessmentYear}`,
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
      .pipe(tap((years) => {}));
  }

  deleteEmpSuggest(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
  }
}
