import { Injectable } from '@angular/core';
import { UUID } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface AttitudeWithGroupNameDto {
  id: UUID;
  attitude_skill_name: string;
  group_attitude_skill_id: UUID;
  group_name: string;
  enabled: 1;
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
    group_attitude_skill_id: UUID; // Use ID instead of name
    enabled: number;
  }): Observable<AttitudeWithGroupNameDto> {
    const headers = {
      Authorization: `Bearer ${this.token}`, // Replace `this.token` with your actual token variable
    };

    return this.http.post<AttitudeWithGroupNameDto>(
      `${this.apiUrl}`,
      attitudeSkill,
      { headers }
    );
  }

  // Update an existing achievement
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
      Authorization: `Bearer ${this.token}`, // Replace `this.token` with your actual token variable
    };
    return this.http
      .get<AttitudeWithGroupNameDto[]>(
        'http://localhost:8080/group-attitude-skill',
        { headers }
      )
      .pipe(
        // Transform the fetched data to fit the dropdown's requirement
        map((data) =>
          data.map((item) => ({
            label: item.group_name, // Use the correct field here
            value: item.id, // Use the correct field here, or an ID if applicable
          }))
        )
      );
  }

  // Delete a group attitude skill by ID
  deleteAttitudeSkill(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Attitude Skill with ID: ${id}`)));
  }

  // Fetch all attitude skills associated with a specific group by its name
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
