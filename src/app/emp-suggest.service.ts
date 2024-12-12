import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';
import { ApiResponse } from './core/models/api-response.model';
import { map } from 'rxjs/operators';

export interface EmpSuggestDto {
  user_id: UUID;
  suggestion: string;
  assessment_year: number;
}

@Injectable({
  providedIn: 'root',
})
export class EmpSuggestService {
  private apiUrl = 'http://localhost:8080/emp-suggest';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpSuggest(payload: EmpSuggestDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(`${this.apiUrl}/create`, payload, { headers })
      .pipe(
        tap((data) => {
          console.log('Data stored successfully:', data);
        })
      );
  }

  getEmpSuggestByUserId(userId: string): Observable<EmpSuggestDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<ApiResponse<EmpSuggestDto[]>>(`${this.apiUrl}/user/${userId}`, {
        headers,
      })
      .pipe(map((response) => response.content));
  }
}
