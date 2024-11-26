import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';
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

  constructor(private http: HttpClient) {}

  // Fetch all group achievements
  getAllAchievementsWithGroupNames(): Observable<AchieveWithGroupNameDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<AchieveWithGroupNameDto[]>(`${this.apiUrl}/with-group-names`, {
        headers,
      })
      .pipe(tap((data) => console.log('Fetched Achievements:', data)));
  }

  // Create a new achievement
  createAchievement(achievement: {
    achievement_name: string;
    group_achievement_id: UUID; // Use ID instead of name
    enabled: number;
  }): Observable<AchieveWithGroupNameDto> {
    const headers = {
      Authorization: `Bearer ${this.token}`, // Replace `this.token` with your actual token variable
    };

    return this.http.post<AchieveWithGroupNameDto>(
      `${this.apiUrl}`,
      achievement,
      { headers }
    );
  }

  // Update an existing achievement
  updateAchievement(
    id: UUID,
    achievement: {
      achievement_name: string;
      group_achievement_id: UUID;
      enabled: number;
    }
  ): Observable<AchieveWithGroupNameDto> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    return this.http.put<AchieveWithGroupNameDto>(
      `${this.apiUrl}/${id}`,
      achievement,
      { headers }
    );
  }

  getGroupAchievements(): Observable<{ label: string; value: string }[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`, // Replace `this.token` with your actual token variable
    };
    return this.http
      .get<AchieveWithGroupNameDto[]>(
        'http://localhost:8080/group-achievements',
        { headers }
      )
      .pipe(
        tap((data) => console.log('Fetched group achievements:', data)),
        // Transform the fetched data to fit the dropdown's requirement
        map((data) =>
          data.map((item) => ({
            label: item.group_achievement_name, // Use the correct field here
            value: item.id, // Use the correct field here, or an ID if applicable
          }))
        )
      );
  }

  deleteAchievement(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Achievement with ID: ${id}`)));
  }
}
