import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { EmpTechSkillCreateDto } from './emp-technical-skill.service';
import { ApiResponse } from './core/models/api-response.model';

export interface EmpAttitudeSkillCreateDto {
  user_id: UUID;
  attitude_skill_id: UUID;
  score: number;
  assessment_year: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmpAttitudeSkillNewService {
  private apiUrl = 'http://localhost:8080/emp-attitude-skill';
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill/all-with-att';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpAttitudeSkills(payload: EmpAttitudeSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }

  getAllAttitudeSkillsByUserId(
    userId: string,
    year: number
  ): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<any[]>(`${this.apiUrl}/user/${userId}/${year}`, { headers })
      .pipe(tap((data) => console.log('Fetched Attitude Skills:', data)));
  }

  getAllGroupWithAttitudeSkills(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl2}`, { headers })
      .pipe(
        map((response) => response.content)
      );
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
      .pipe(
        tap((data) => {
          console.log('Data fetched successfully:', data);
        })
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
