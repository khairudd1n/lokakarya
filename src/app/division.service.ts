import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';

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
    return this.http
      .get<DivisionDto[]>(`${this.apiUrl}`, { headers })
      .pipe(tap((data) => console.log('Fetched Divisions:', data)));
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
    return this.http
      .put<DivisionDto>(`${this.apiUrl}/${id}`, data, { headers })
      .pipe(
        tap((updatedData) => console.log('Updated Division:', updatedData))
      );
  }

  deleteDivision(id: UUID): Observable<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(tap(() => console.log(`Deleted Division with ID: ${id}`)));
  }
}
