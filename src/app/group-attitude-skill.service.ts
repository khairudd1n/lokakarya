import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';

export interface GroupAttitudeSkillDto {
  id: UUID;
  group_name: string;
  percentage: number;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class GroupAttitudeSkillService {
  private apiUrl = 'http://localhost:8080/group-attitude-skill';

  constructor(private http: HttpClient) {}

  // Fetch all group achievements
  getAllGroupAttitudeSkills(): Observable<GroupAttitudeSkillDto[]> {
    return this.http
      .get<GroupAttitudeSkillDto[]>(`${this.apiUrl}`)
      .pipe(tap((data) => console.log('Fetched Group Attitude Skills:', data)));
  }

  createGroupAttitudeSkill(
    data: Partial<GroupAttitudeSkillDto>
  ): Observable<GroupAttitudeSkillDto> {
    return this.http.post<GroupAttitudeSkillDto>(`${this.apiUrl}`, data);
  }

  // Update an existing group attitude skill
  updateGroupAttitudeSkill(
    id: UUID,
    data: Partial<GroupAttitudeSkillDto>
  ): Observable<GroupAttitudeSkillDto> {
    return this.http
      .put<GroupAttitudeSkillDto>(`${this.apiUrl}/${id}`, data)
      .pipe(
        tap((updatedData) =>
          console.log('Updated Group Attitude Skill:', updatedData)
        )
      );
  }

  // Delete a group attitude skill by ID
  deleteGroupAttitudeSkill(id: UUID): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => console.log(`Deleted Group Attitude Skill with ID: ${id}`))
      );
  }
}
