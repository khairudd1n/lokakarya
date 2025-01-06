import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './core/models/api-response.model';

export interface GroupAttitudeSkill {
  id: string;
  group_name: string;
  percentage: number;
  enabled: boolean;
}

export interface CreatedBy {
  id: string;
  username: string;
  full_name: string;
  email_address: string;
}

export interface AttitudeSkill {
  attitude_skill_name: string;
}

export interface EmpAttitudeSkillDto {
  id: string;
  attitude_skill: AttitudeSkill;
  score: number;
  assessment_year: number;
  enabled: boolean;
  group_attitude_skill: GroupAttitudeSkill;
  created_at: string;
  created_by: CreatedBy;
}

@Injectable({
  providedIn: 'root',
})
export class SumWithDetailService {
  private apiUrl = 'http://localhost:8080/emp-attitude-skill';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getEmpAttSkillByUserId(
    userId: string,
    year: number
  ): Observable<ApiResponse<EmpAttitudeSkillDto[]>> {
    return this.http
      .get<ApiResponse<EmpAttitudeSkillDto[]>>(
        `${this.apiUrl}/user/${userId}/${year}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { enabledOnly: 'true' },
        }
      )
      .pipe(map((response) => response));
  }
}
