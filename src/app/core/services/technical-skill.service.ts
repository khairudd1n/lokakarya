import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TechnicalSkill } from '../models/technical-skill.model';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TechnicalSkillService {
  url: string = 'http://localhost:8080/tech-skill';
  token: string = localStorage.getItem('token') || '';

  constructor(readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<TechnicalSkill[]>> {
    return this.http
      .get<ApiResponse<TechnicalSkill[]>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  save(
    technicalSkill: TechnicalSkill
  ): Observable<ApiResponse<TechnicalSkill>> {
    return this.http
      .post<ApiResponse<TechnicalSkill>>(`${this.url}/save`, technicalSkill, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }

  update(
    technicalSkill: TechnicalSkill
  ): Observable<ApiResponse<TechnicalSkill>> {
    return this.http
      .patch<ApiResponse<TechnicalSkill>>(
        `${this.url}/update/${technicalSkill.id}`,
        technicalSkill,
        { headers: { Authorization: `Bearer ${this.token}` } }
      )
      .pipe(map((response) => response));
  }

  delete(id: number): Observable<ApiResponse<Boolean>> {
    console.log(id);
    return this.http
      .delete<ApiResponse<Boolean>>(`${this.url}/delete/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response));
  }
}
