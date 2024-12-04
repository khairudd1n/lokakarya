import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';

export interface EmpTechSkillCreateDto {
  user_id: UUID;
  tech_skill_id: UUID;
  tech_detail: string;
  score: number;
  assessment_year: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmpTechnicalSkillService {
  private apiUrl = 'http://localhost:8080/emp-tech-skill/save'; // Backend API endpoint
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpTechSkill(payload: EmpTechSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers });
  }
}
