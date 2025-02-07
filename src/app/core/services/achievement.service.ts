import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { map } from 'rxjs/operators';

export interface AchieveWithGroupNameDto {
  id: UUID;
  achievement_name: string;
  group_achievement_id: UUID;
  group_achievement_name: string;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  private apiUrl = 'http://localhost:8080/achievements';
  token: string = localStorage.getItem('token') || '';
  headers_token = {
    Authorization: `Bearer ${this.token}`,
  };

  constructor(private http: HttpClient) {}

  getAllAchievementsWithGroupNames(): Observable<AchieveWithGroupNameDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<AchieveWithGroupNameDto[]>(
      `${this.apiUrl}/with-group-names`,
      {
        headers,
      }
    );
  }

  createAchievement(achievement: {
    achievement_name: string;
    group_achievement_id: UUID;
    enabled: number;
  }): Observable<AchieveWithGroupNameDto> {
    return this.http.post<AchieveWithGroupNameDto>(
      `${this.apiUrl}`,
      achievement,
      { headers: this.headers_token }
    );
  }

  updateAchievement(
    id: UUID,
    achievement: {
      achievement_name: string;
      group_achievement_id: UUID;
      enabled: number;
    }
  ): Observable<AchieveWithGroupNameDto> {
    return this.http.put<AchieveWithGroupNameDto>(
      `${this.apiUrl}/${id}`,
      achievement,
      { headers: this.headers_token }
    );
  }

  getGroupAchievements(): Observable<{ label: string; value: string }[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<{ group_achievement_name: string; id: string }[]>(
        'http://localhost:8080/group-achievements',
        { headers }
      )
      .pipe(
        map((data) =>
          data.map((item) => ({
            label: item.group_achievement_name,
            value: item.id,
          }))
        )
      );
  }

  deleteAchievement(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
