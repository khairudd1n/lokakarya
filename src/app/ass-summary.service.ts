import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs';
import { map } from 'rxjs';

export interface GroupAchieveDto {
  id: UUID;
  group_achievement_name: string;
  percentage: number;
  enabled: number;
}

export interface GroupAttitudeSkillDto {
  id: UUID;
  group_name: string;
  percentage: number;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class AssSummaryService {
  private apiUrl1 = 'http://localhost:8080/group-achievements';
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getAllGroupAttitudeSkills(): Observable<GroupAttitudeSkillDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<GroupAttitudeSkillDto[]>(`${this.apiUrl2}`, { headers })
      .pipe(tap((data) => console.log('Fetched Group Attitude Skills:', data)));
  }

  getAllGroupAchievements(): Observable<GroupAchieveDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<GroupAchieveDto[]>(`${this.apiUrl1}`, {
      headers,
    });
  }

  getUsers(): Observable<{ label: string; value: string }[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`, // Replace `this.token` with your actual token variable
    };

    return this.http
      .get<{ content: { username: string; id: string }[] }>(
        'http://localhost:8080/user/all',
        { headers }
      )
      .pipe(
        tap((data) => console.log('Fetched users:', data)),
        map((response) =>
          response.content.map((item) => ({
            label: item.username, // Full name for dropdown label
            value: item.id, // ID for dropdown value
          }))
        )
      );
  }
}
