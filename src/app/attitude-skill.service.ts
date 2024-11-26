import { Injectable } from '@angular/core';
import { UUID } from 'crypto';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';

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

  constructor(private http: HttpClient) {}

  getAllAttitudesWithGroupNames(): Observable<AttitudeWithGroupNameDto[]> {
    return this.http
      .get<AttitudeWithGroupNameDto[]>(`${this.apiUrl}/with-group-names`)
      .pipe(tap((data) => console.log('Fetched Achievements:', data)));
  }

  createAttitudeSkill(attitudeSkill: {
    attitude_skill_name: string;
    group_attitude_skill_id: UUID; // Use ID instead of name
    enabled: number;
  }): Observable<AttitudeWithGroupNameDto> {
    return this.http.post<AttitudeWithGroupNameDto>(
      `${this.apiUrl}`,
      attitudeSkill
    );
  }

  getGroupAttitudeSkills(): Observable<{ label: string; value: string }[]> {
    return this.http
      .get<AttitudeWithGroupNameDto[]>(
        'http://localhost:8080/group-attitude-skill'
      )
      .pipe(
        // Transform the fetched data to fit the dropdown's requirement
        map((data) =>
          data.map((item) => ({
            label: item.group_name, // Use the correct field here
            value: item.group_attitude_skill_id, // Use the correct field here, or an ID if applicable
          }))
        )
      );
  }
}
