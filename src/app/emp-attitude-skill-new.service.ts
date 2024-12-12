import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { tap } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/emp-attitude-skill'; // Backend API endpoint
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill/all';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpAttitudeSkills(payload: EmpAttitudeSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }

  getAllGroupWithAttitudeSkills(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<any[]>(`${this.apiUrl2}`, { headers })
      .pipe(
        tap((data) =>
          console.log('Fetched Group Attitude with Attitude skills:', data)
        )
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
}
