import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface GroupAttitudeSkillDto {
  id: UUID;
  group_name: string;
  percentage: number;
  enabled: number;
}

export interface AttitudeSkill {
  id: UUID;
  attitude_skill_name: string;
}

export interface GroupAttWithAttDto {
  id: UUID;
  group_name: string;
  attitudeSkills: AttitudeSkill[];
}

@Injectable({
  providedIn: 'root',
})
export class GroupAttitudeSkillService {
  private apiUrl = 'http://localhost:8080/group-attitude-skill';
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill/all';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}


  getAllGroupAttitudeSkillWithCount(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<GroupAttWithAttDto[]>>(`${this.apiUrl}/count`, { headers })
      .pipe(
        map((data) => data.content),
      );
  }

  getAllGroupAttitudeSkills(): Observable<GroupAttitudeSkillDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<GroupAttitudeSkillDto[]>>(`${this.apiUrl}`, { headers })
      .pipe(
        map((data) => data.content));
  }

  getAllGroupWithAttitudeSkills(): Observable<GroupAttWithAttDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<GroupAttWithAttDto[]>>(`${this.apiUrl2}`, { headers })
      .pipe(
        map((data) => data.content)
      );
  }

  createGroupAttitudeSkill(
    data: Partial<GroupAttitudeSkillDto>
  ): Observable<GroupAttitudeSkillDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http.post<ApiResponse<GroupAttitudeSkillDto>>(`${this.apiUrl}`, data, {
      headers,
    }).pipe(
      map((response) => response.content)
    );
  }

  // Update an existing group attitude skill
  updateGroupAttitudeSkill(
    id: UUID,
    data: Partial<GroupAttitudeSkillDto>
  ): Observable<GroupAttitudeSkillDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http
      .put<ApiResponse<GroupAttitudeSkillDto>>(`${this.apiUrl}/${id}`, data, { headers })
      .pipe(
        map((response) => response.content)
      );
  }

  // Delete a group attitude skill by ID
  deleteGroupAttitudeSkill(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        tap(() => console.log(`Deleted Group Attitude Skill with ID: ${id}`))
      );
  }
}
