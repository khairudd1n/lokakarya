import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { tap } from 'rxjs/operators';

export interface TechSkillDto {
  id: UUID;
  technical_skill: string;
  enabled: number;
}

@Injectable({
  providedIn: 'root',
})
export class TechnicalSkillService {
  private apiUrl = 'http://localhost:8080/tech-skill';

  constructor(private http: HttpClient) {}

  findAll(): Observable<TechSkillDto[]> {
    return this.http
      .get<TechSkillDto[]>(`${this.apiUrl}/all`)
      .pipe(tap((data) => console.log('Fetched Tech Skills:', data)));
  }

  save(data: Partial<TechSkillDto>): Observable<TechSkillDto> {
    return this.http.post<TechSkillDto>(`${this.apiUrl}/save`, data);
  }
}
