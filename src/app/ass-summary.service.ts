import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { map } from 'rxjs';
import { EmpAchieveService } from './emp-achieve.service';
import { EmpAttitudeSkillNewService } from './emp-attitude-skill-new.service';
import { GroupAttitudeSkillService } from './core/services/group-attitude-skill.service';
import { GroupAchievementsService } from './core/services/group-achievements.service';
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
    
    return this.http
      .post(
        `${this.url}/generate/${userId}/${year}`,
        {},
        { headers: { Authorization: `Bearer ${this.token}` } }
      )
      .pipe(map((response) => response));
  }

  getAssessmentSummary(userId: string, year: number): Observable<any> {
    
    return this.http
      .get(`${this.url}/summary`, {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { userId, year },
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

  getAllAssSummary(): Observable<ApiResponse<any>> {
    return this.http
      .get<ApiResponse<any>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  getPaginatedAssSummary(
    searchTerm: string,
    year: number,
    division: string[],
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('searchTerm', searchTerm);
    }

    if (year) {
      params = params.set('year', year.toString());
    }

    if (division && division.length > 0) {
      division.forEach((id) => {
        params = params.append('divisionIds', id);
      });
    }

    return this.http
      .get<ApiResponse<any>>(`${this.url}/all`, {
        headers,
        params,
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

  updateAssessSumStatusToApprove(id: string): Observable<ApiResponse<any>> {
    
    return this.http
      .patch<ApiResponse<any>>(
        `${this.url}/update-status-to-approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      )
      .pipe(map((response) => response));
  }

  updateAssessSumStatusToUnapprove(id: string): Observable<ApiResponse<any>> {
    
    return this.http
      .patch<ApiResponse<any>>(
        `${this.url}/update-status-to-unapprove/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      )
      .pipe(map((response) => response));
  }
}
