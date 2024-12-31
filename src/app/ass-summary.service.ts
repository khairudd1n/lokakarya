import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs';
import { map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { EmpAchieveService } from './emp-achieve.service';
import { EmpAttitudeSkillNewService } from './emp-attitude-skill-new.service';
import { GroupAttitudeSkillService } from './core/services/group-attitude-skill.service';
import { GroupAchievementsService } from './core/services/group-achievements.service';
import { GroupedData, GroupedResult } from './core/models/summary.model';
import { ApiResponse } from './core/models/api-response.model';

export interface GroupAchieveDto {
  id: UUID;
  group_achievement_name: string;
  percentage: number;
  enabled: number;
}

export interface GroupAttitudeSkillDto {
  id: UUID;
  group_name: string;
  percentage: number;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class AssSummaryService {
  private url = 'http://localhost:8080/assess-sum';
  private token = localStorage.getItem('token') || '';
  constructor(
    private http: HttpClient,
    private empAchieveService: EmpAchieveService,
    private empAttitudeSkillService: EmpAttitudeSkillNewService,
    private groupAttitudeSkillService: GroupAttitudeSkillService,
    private groupAchievementService: GroupAchievementsService
  ) {}

  saveAssSummary(userId: string, score: number, year: number): Observable<any> {
    console.log('saving ass summary');
    const currentYear = new Date().getFullYear();
    const data = {
      user_id: userId,
      year: year,
      score: score,
      status: 1,
    };
    return this.http
      .post(`${this.url}/save`, data, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  generateAssSummary(userId: string, year: number): Observable<any> {
    console.log('generating ass summary');
    return this.http
      .post(
        `${this.url}/generate/${userId}/${year}`,
        {},
        { headers: { Authorization: `Bearer ${this.token}` } }
      )
      .pipe(map((response) => response));
  }

  getAssessmentSummary(userId: string, year: number): Observable<any> {
    console.log('Fetching assessment summary');
    return this.http
      .get(`${this.url}/summary`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { userId, year }, // Pass userId and year as query parameters
      })
      .pipe(map((response) => response));
  }

  getAssSummaryDetail(userId: string, year: number): Observable<any> {
    return this.http
      .get(`${this.url}/detail/${userId}/${year}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  getAllAssSummary(): Observable<ApiResponse<any[]>> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  getAllUserAssSummary(userId: string): Observable<ApiResponse<any[]>> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.url}/detail-by-user/${userId}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  getAllAssSummaryByYear(year: number): Observable<ApiResponse<any[]>> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { year: year },
      })
      .pipe(map((response) => response));
  }
}
