import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap, switchMap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { ApiResponse } from './core/models/api-response.model';

export interface EmpAttitudeSkillCreateDto {
  id: string;
  user_id: UUID;
  attitude_skill_id: UUID;
  score: number;
  assessment_year: number;
}

export interface EmpAttitudeSkillUpdateRequest {
  id: string;
  userId?: string;
  attitudeSkillId: string;
  score?: number;
  assessmentYear?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmpAttitudeSkillNewService {
  private apiUrl = 'http://localhost:8080/emp-attitude-skill';
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill/all-with-att';
  private assessSumUrl = 'http://localhost:8080/assess-sum';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpAttitudeSkills(payload: EmpAttitudeSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers }).pipe(
      map((response) => response),
      switchMap(() =>
        this.http.post<void>(
          `${this.assessSumUrl}/generate/${payload[0].user_id}/${payload[0].assessment_year}`,
          {},
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
      )
    );
  }

  updateEmpAttitudeSkill(
    id: UUID,
    payload: EmpAttitudeSkillCreateDto
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<EmpAttitudeSkillCreateDto>(`${this.apiUrl}/${id}`, payload, {
        headers,
      })
      .pipe(
        tap((updatedSkill) => {}),
        switchMap(() =>
          this.http.post<void>(
            `${this.assessSumUrl}/generate/${payload.user_id}/${payload.assessment_year}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          )
        )
      );
  }

  updateEmpAttitudeSkills(
    payload: {
      id: string;
      attitude_skill_id: string;
      user_id: string;
      assessment_year: number;
      score: number;
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
      .pipe(
        tap((updatedSkills) => {}),
        switchMap(() =>
          this.http.post<void>(
            `${this.assessSumUrl}/generate/${payload[0].user_id}/${payload[0].assessment_year}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          )
        )
      );
  }

  getAllEmpAttitudeSkills(): Observable<EmpAttitudeSkillCreateDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<EmpAttitudeSkillCreateDto[]>(this.apiUrl, { headers });
  }

  getAllAttitudeSkillsByUserId(
    userId: string,
    year: number
  ): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/${year}`, {
      headers,
    });
  }

  getAllGroupWithAttitudeSkills(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl2}`, { headers })
      .pipe(map((response) => response.content));
  }

  getEmpAttSkillByUserId(
    userId: string
  ): Observable<EmpAttitudeSkillCreateDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<EmpAttitudeSkillCreateDto[]>(`${this.apiUrl}/user/${userId}`, {
        headers,
      })
      .pipe(tap((data) => {}));
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

  getAllUsers(): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<any[]>(`${this.apiUrl}/user-only`, { headers })
      .pipe(tap((users) => {}));
  }

  deleteEmpAttitudeSkill(id: UUID): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http
      .delete<any>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap((response) => {}));
  }
}
