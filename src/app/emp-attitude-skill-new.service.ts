import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap, switchMap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { UUID } from 'crypto';
import { EmpTechSkillCreateDto } from './emp-technical-skill.service';
import { ApiResponse } from './core/models/api-response.model';

export interface EmpAttitudeSkillCreateDto {
  id: string;
  user_id: UUID;
  attitude_skill_id: UUID;
  score: number;
  assessment_year: number;
}

export interface EmpAttitudeSkillUpdateRequest {
  id: string; // UUID dari EmpAttitudeSkill yang ingin diperbarui
  userId?: string; // UUID dari User yang terkait
  attitudeSkillId: string; // UUID dari AttitudeSkill yang terkait
  score?: number; // Nilai yang ingin diperbarui
  assessmentYear?: number; // Tahun penilaian yang ingin diperbarui
}

@Injectable({
  providedIn: 'root',
})
export class EmpAttitudeSkillNewService {
  private apiUrl = 'http://localhost:8080/emp-attitude-skill';
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill/all-with-att';
  private assessSumUrl = 'http://localhost:8080/assess-sum';
  private token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  saveEmpAttitudeSkills(payload: EmpAttitudeSkillCreateDto[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.apiUrl, payload, { headers }).pipe(
      map((response) => response),
      switchMap(() =>
        this.http.post<void>(
          `${this.assessSumUrl}/generate/${payload[0].user_id}/${payload[0].assessment_year}`,
          {},
          { headers: { Authorization: `Bearer ${this.token}` } }
        )
        
      )
    );
  }

  updateEmpAttitudeSkill(
    id: UUID,
    payload: EmpAttitudeSkillCreateDto
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('Payload untuk update:', payload);
    return this.http
      .put<EmpAttitudeSkillCreateDto>(`${this.apiUrl}/${id}`, payload, {
        headers,
      })
      .pipe(
        tap((updatedSkill) => {
          console.log('Successfully updated skill:', updatedSkill);
        }),
        switchMap(() =>
          this.http.post<void>(
            `${this.assessSumUrl}/generate/${payload.user_id}/${payload.assessment_year}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          )
        )
      );
  }

  // updateEmpAttitudeSkills(
  //   payload: EmpAttitudeSkillUpdateRequest[]
  // ): Observable<EmpAttitudeSkillCreateDto[]> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //     'Content-Type': 'application/json',
  //   });

  //   console.log('Payload untuk update:', payload);

  //   return this.http
  //     .put<EmpAttitudeSkillCreateDto[]>(`${this.apiUrl}`, payload, {
  //       headers,
  //     })
  //     .pipe(
  //       tap((updatedSkills) => {
  //         console.log('Successfully updated skills:', updatedSkills);
  //       })
  //     );
  // }

  updateEmpAttitudeSkills(
    payload: {
      id: string;
      attitude_skill_id: string;
      user_id: string;
      assessment_year: number;
      score: number;
    }[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log('Payload untuk update:', payload);

    return this.http
      .put(`${this.apiUrl}`, payload, {
        headers,
      })
      .pipe(
        tap((updatedSkills) => {
          console.log('Successfully updated skills:', updatedSkills);
        }),
        switchMap(() =>
          this.http.post<void>(
            `${this.assessSumUrl}/generate/${payload[0].user_id}/${payload[0].assessment_year}`,
            {},
            { headers: { Authorization: `Bearer ${this.token}` } }
          )
        )
      );
  }

  getAllEmpAttitudeSkills(): Observable<EmpAttitudeSkillCreateDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<EmpAttitudeSkillCreateDto[]>(this.apiUrl, { headers })
      .pipe(
        tap((data) => {
          console.log('Fetched all Emp Attitude Skills:', data);
        })
      );
  }

  getAllAttitudeSkillsByUserId(
    userId: string,
    year: number
  ): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<any[]>(`${this.apiUrl}/user/${userId}/${year}`, { headers })
      .pipe(tap((data) => console.log('Fetched Attitude Skills:', data)));
  }

  getAllGroupWithAttitudeSkills(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl2}`, { headers })
      .pipe(map((response) => response.content));
  }

  getEmpAttSkillByUserId(
    userId: string
  ): Observable<EmpAttitudeSkillCreateDto[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<EmpAttitudeSkillCreateDto[]>(`${this.apiUrl}/user/${userId}`, {
        headers,
      })
      .pipe(
        tap((data) => {
          console.log('Data fetched successfully:', data);
        })
      );
  }

  getAssessmentYears(): Observable<number[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .get<number[]>(`${this.apiUrl}/assessment-years`, { headers })
      .pipe(
        tap((years) => {
          console.log('Retrieved assessment years:', years);
        })
      );
  }

  // Delete Emp Attitude Skill by ID
  deleteEmpAttitudeSkill(id: UUID): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap((response) => {
        console.log('Successfully deleted Emp Attitude Skill:', response);
      })
    );
  }
}
