import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';

export interface GroupAchieveDto {
  id: UUID;
  group_achievement_name: string;
  percentage: number;
  enabled: number;
  created_at: Date;
  created_by: UUID;
  updated_at: Date;
  updated_by: UUID;
  // Tambahkan properti lainnya sesuai dengan DTO
}

@Injectable({
  providedIn: 'root',
})
export class GroupAchievementsService {
  private apiUrl = 'http://localhost:8080/group-achievements'; // Sesuaikan URL backend

  constructor(private http: HttpClient) {}

  // Fetch all group achievements
  getAllGroupAchievements(): Observable<GroupAchieveDto[]> {
    return this.http.get<GroupAchieveDto[]>(this.apiUrl);
  }

  // Create a new group achievement
  createGroupAchievement(
    data: Partial<GroupAchieveDto>
  ): Observable<GroupAchieveDto> {
    return this.http.post<GroupAchieveDto>(`${this.apiUrl}`, data);
  }
}
