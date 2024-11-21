import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';

export interface AchieveDto {
  id: UUID;
  achievement_name: string;
  group_achievement_id: UUID;
  enabled: number;
  created_at: Date;
  created_by: UUID;
  updated_at: Date;
  updated_by: UUID;
}

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  private apiUrl = 'http://localhost:8080/achievements';

  constructor(private http: HttpClient) {}

  // Fetch all group achievements
  getAllAchievements(): Observable<AchieveDto[]> {
    return this.http.get<AchieveDto[]>(this.apiUrl);
  }
}
