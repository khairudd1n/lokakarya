import { Injectable } from '@angular/core';
import { UUID } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { ApiResponse } from './core/models/api-response.model';

export interface EmpAchieveSkillDto {
  id: UUID;
  user_id: UUID;
  username: string;
  notes: string;
  achievement_id: UUID;
  achievement_name: string;
  score: number;
  assessment_year: number;
}
@Injectable({
  providedIn: 'root',
})
export class EmpAchieveService {
  private apiUrl = 'http://localhost:8080/emp-achievements-skill';
  private assessSumUrl = 'http://localhost:8080/assess-sum';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getAllEmpAchieveByUserId(userId: string): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl}/user/${userId}`, {
        headers,
      })
      .pipe(map((response) => response.content));
  }

  getAllEmpAchieve(): Observable<EmpAchieveSkillDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<EmpAchieveSkillDto[]>(`${this.apiUrl}/with-group-names`, {
        headers,
      })
      .pipe(tap((data) => console.log('Fetched Emp Achieve Skill:', data)));
  }

  createEmpAchieve(empAchieve: {
    user_id: UUID;
    notes: string;
    achievement_id: UUID;
    score: number;
    assessment_year: number;
  }): Observable<any> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http
      .post<EmpAchieveSkillDto>(`${this.apiUrl}`, empAchieve, {
        headers,
      })
      .pipe(
        tap((response) => console.log('Created Emp Achieve:', response)),

        switchMap(() =>
          this.http.post<void>(
            `${this.assessSumUrl}/generate/${empAchieve.user_id}/${empAchieve.assessment_year}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          )
        ),
        tap(() =>
          console.log('Generated Assessment Summary (no response needed)')
        )
      );
  }

  updateEmpAchieve(
    id: UUID,
    empAchieve: {
      user_id: UUID;
      notes: string;
      achievement_id: UUID;
      score: number;
      assessment_year: number;
    }
  ): Observable<EmpAchieveSkillDto> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http
      .put<EmpAchieveSkillDto>(`${this.apiUrl}/${id}`, empAchieve, { headers })
      .pipe(tap((response) => console.log('Updated Emp Achieve:', response)));
  }

  updateEmpAchieveAndGenerateSummary(
    id: UUID,
    empAchieve: {
      user_id: UUID;
      notes: string;
      achievement_id: UUID;
      score: number;
      assessment_year: number;
    }
  ): Observable<any> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http
      .put<EmpAchieveSkillDto>(`${this.apiUrl}/${id}`, empAchieve, { headers })
      .pipe(
        tap((updateResponse) =>
          console.log('Updated Emp Achieve:', updateResponse)
        ),
        switchMap(() =>
          this.http.post(
            `${this.assessSumUrl}/generate/${empAchieve.user_id}/${empAchieve.assessment_year}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          )
        ),
        tap(() =>
          console.log('Generated Assessment Summary (no response needed)')
        )
      );
  }

  getUsers(): Observable<{ label: string; value: string }[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http
      .get<{ content: { username: string; id: string }[] }>(
        'http://localhost:8080/user/all',
        { headers }
      )
      .pipe(
        tap((data) => console.log('Fetched users:', data)),
        map((response) =>
          response.content.map((item) => ({
            label: item.username,
            value: item.id,
          }))
        )
      );
  }

  getAchievements(): Observable<{ label: string; value: string }[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<EmpAchieveSkillDto[]>('http://localhost:8080/achievements', {
        headers,
      })
      .pipe(
        tap((data) => console.log('Fetched achievements:', data)),

        map((data) =>
          data.map((item) => ({
            label: item.achievement_name,
            value: item.id,
          }))
        )
      );
  }

  deleteEmpAchieve(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Emp Achieve with ID: ${id}`)));
  }
}
