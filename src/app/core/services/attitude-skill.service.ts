import { Injectable } from '@angular/core';
import { UUID } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface AttitudeWithGroupNameDto {
  id: UUID;
  attitude_skill_name: string;
  group_attitude_skill_id: UUID;
  group_name: string;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttitudeSkillService {
  private apiUrl = 'http://localhost:8080/attitude-skill';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getAllAttitudesWithGroupNames(): Observable<AttitudeWithGroupNameDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<AttitudeWithGroupNameDto[]>(`${this.apiUrl}/with-group-names`, {
        headers,
      })
      .pipe(tap((data) => console.log('Fetched Attitude Skills:', data)));
  }

  createAttitudeSkill(attitudeSkill: {
    attitude_skill_name: string;
    group_attitude_skill_id: UUID;
    enabled: number;
  }): Observable<AttitudeWithGroupNameDto> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http.post<AttitudeWithGroupNameDto>(
      `${this.apiUrl}`,
      attitudeSkill,
      { headers }
    );
  }

  updateAttitudeSkill(
    id: UUID,
    attitudeSkill: {
      attitude_skill_name: string;
      group_attitude_skill_id: UUID;
      enabled: number;
    }
  ): Observable<AttitudeWithGroupNameDto> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http.put<AttitudeWithGroupNameDto>(
      `${this.apiUrl}/${id}`,
      attitudeSkill,
      { headers }
    );
  }

  getGroupAttitudeSkills(): Observable<{ label: string; value: string }[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<AttitudeWithGroupNameDto[]>>(
        'http://localhost:8080/group-attitude-skill/all',
        { headers }
      )
      .pipe(
        map((data) =>
          data.content.map((item) => ({
            label: item.group_name,
            value: item.id,
          }))
        )
      );
  }

  deleteAttitudeSkill(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Attitude Skill with ID: ${id}`)));
  }

  getAttitudesByGroupName(
    groupName: string
  ): Observable<AttitudeWithGroupNameDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<AttitudeWithGroupNameDto[]>(`${this.apiUrl}/all`, {
        headers,
      })
      .pipe(
        tap((data) =>
          console.log(`Fetched attitude skills for group: ${groupName}`, data)
        )
      );
  }
}
