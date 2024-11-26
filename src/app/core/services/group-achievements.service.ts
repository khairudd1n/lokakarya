import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  // Tambahkan properti lainnya sesuai dengan DTO
}

@Injectable({
  providedIn: 'root',
})
export class GroupAchievementsService {
  private apiUrl = 'http://localhost:8080/group-achievements'; // Sesuaikan URL backend
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  // Fetch all group achievements
  getAllGroupAchievements(): Observable<GroupAchieveDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<GroupAchieveDto[]>(`${this.apiUrl}`, {
      headers,
    });
  }

  // Create a new group achievement
  createGroupAchievement(
    data: Partial<GroupAchieveDto>
  ): Observable<GroupAchieveDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http.post<GroupAchieveDto>(`${this.apiUrl}`, data, {
      headers,
    });
  }

  // Update an existing group attitude skill
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

  // Delete a group attitude skill by ID
  deleteGroupAchievement(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Group Achievement with ID: ${id}`)));
  }
}
