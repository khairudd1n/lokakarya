import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs';

export interface GroupAchieveDto {
  id: UUID;
  group_achievement_name: string;
  percentage: number;
  enabled: number;
  created_at: Date;
  created_by: UUID;
  updated_at: Date;
  updated_by: UUID;
}

@Injectable({
  providedIn: 'root',
})
export class GroupAchievementsService {
  private apiUrl = 'http://localhost:8080/group-achievements';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getAllGroupAchievementWithCount(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<any[]>(`${this.apiUrl}/count`, { headers })
      .pipe(map((data) => data));
  }

  getAllGroupAchievements(): Observable<GroupAchieveDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<GroupAchieveDto[]>(`${this.apiUrl}`, {
      headers,
    });
  }

  createGroupAchievement(
    data: Partial<GroupAchieveDto>
  ): Observable<GroupAchieveDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http.post<GroupAchieveDto>(`${this.apiUrl}`, data, {
      headers,
    });
  }

  updateGroupAchievement(
    id: UUID,
    data: Partial<GroupAchieveDto>
  ): Observable<GroupAchieveDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http
      .put<GroupAchieveDto>(`${this.apiUrl}/${id}`, data, { headers })
      .pipe(
        tap((updatedData) =>
          console.log('Updated Group Attitude Skill:', updatedData)
        )
      );
  }

  deleteGroupAchievement(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Group Achievement with ID: ${id}`)));
  }
}
