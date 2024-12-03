import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';

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
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpAttitudeSkills(payload: EmpAttitudeSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }
}
