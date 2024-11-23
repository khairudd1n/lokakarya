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

  constructor(private http: HttpClient) {}

  // Fetch all group achievements
  getAllAchievementsWithGroupNames(): Observable<AchieveWithGroupNameDto[]> {
    return this.http
      .get<AchieveWithGroupNameDto[]>(`${this.apiUrl}/with-group-names`)
      .pipe(tap((data) => console.log('Fetched Achievements:', data)));
  }

  // Create a new achievement
  createAchievement(achievement: {
    achievement_name: string;
    group_achievement_id: UUID; // Use ID instead of name
    enabled: number;
  }): Observable<AchieveWithGroupNameDto> {
    return this.http.post<AchieveWithGroupNameDto>(
      `${this.apiUrl}`,
      achievement
    );
  }

  getGroupAchievements(): Observable<{ label: string; value: string }[]> {
    return this.http
      .get<AchieveWithGroupNameDto[]>(
        'http://localhost:8080/group-achievements'
      )
      .pipe(
        // Transform the fetched data to fit the dropdown's requirement
        map((data) =>
          data.map((item) => ({
            label: item.group_achievement_name, // Use the correct field here
            value: item.group_achievement_id, // Use the correct field here, or an ID if applicable
          }))
        )
      );
  }
}
