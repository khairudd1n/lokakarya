import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response.model';

export interface DivisionDto {
  id: UUID;
  division_name: string;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class DivisionService {
  private apiUrl = 'http://localhost:8080/division';
  token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getAllDivisions(): Observable<DivisionDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.get<DivisionDto[]>(`${this.apiUrl}`, { headers });
  }

  getDivisionList(): Observable<DivisionDto[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<DivisionDto[]>>(`${this.apiUrl}/list-name`, { headers })
      .pipe(map((response) => response.content));
  }

  createDivision(data: Partial<DivisionDto>): Observable<DivisionDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http.post<DivisionDto>(`${this.apiUrl}`, data, {
      headers,
    });
  }

  updateDivision(
    id: UUID,
    data: Partial<DivisionDto>
  ): Observable<DivisionDto> {
    const headers = { Authorization: `Bearer ${this.token}` };
    return this.http.put<DivisionDto>(`${this.apiUrl}/${id}`, data, {
      headers,
    });
  }

  deleteDivision(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
