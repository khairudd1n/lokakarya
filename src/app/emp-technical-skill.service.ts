import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { ApiResponse } from './core/models/api-response.model';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

export interface EmpTechSkillCreateDto {
  user_id: UUID;
  tech_skill_id: UUID;
  technical_skill: string;
  tech_detail: string;
  score: number;
  assessment_year: number;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmpTechnicalSkillService {
  private apiUrl = 'http://localhost:8080/emp-tech-skill';
  private apiUrl2 = 'http://localhost:8080/tech-skill/all'; // Backend API endpoint
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpTechSkill(payload: EmpTechSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}/save`, payload, { headers });
  }

  getAllTechSkill(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl2}`, { headers })
      .pipe(map((response) => response.content));
  }

  getSavedTechs(userId: string): Observable<EmpTechSkillCreateDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<EmpTechSkillCreateDto[]>>(
        `${this.apiUrl}/detail/${userId}`,
        { headers }
      )
      .pipe(
        map((response) => {
          console.log(
            'Fetched technical skills for user:',
            userId,
            response.content
          ); // Log the fetched skills
          return response.content;
        })
      );
  }
}