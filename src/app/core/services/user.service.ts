import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  url: string = 'http://localhost:8080/user';
  token: string = localStorage.getItem('token') || '';

  constructor(readonly http: HttpClient) {}

  getAllUser(): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.url}/all`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(
        map((response) => response.content) // Extract content array
      );
  }

  getPaginatedUser(
    searchTerm: string,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ): Observable<ApiResponse<User[]>> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http
      .get<ApiResponse<User[]>>(`${this.url}/all`, { params, headers })
      .pipe(map((response) => response));
  }

  saveUser(user: any): Observable<User> {
    const userToSave = {
      username: user.username,
      full_name: user.full_name,
      position: user.position,
      email_address: user.email_address,
      employee_status: Number(user.employee_status),
      join_date: user.join_date,
      enabled: Number(user.enabled),
      password: user.password,
      role: user.selectedRoles, // Keep the role as is, assuming it's already in the right format
      division_id: user.division, // Map 'division' to 'division_id' for the backend
    };
    return this.http
      .post<ApiResponse<User>>(`${this.url}/save`, userToSave, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(
        map((response) => response.content) // Extract content array
      );
  }

  updateUser(user: any): Observable<User> {
    const userToUpdate = {
      username: user.username,
      full_name: user.full_name,
      position: user.position,
      email_address: user.email_address,
      employee_status: user.employee_status,
      join_date: user.join_date,
      enabled: user.enabled,
      password: user.password,
      role: user.selectedRoles,
      division_id: user.division,
    };
    return this.http
      .patch<ApiResponse<User>>(`${this.url}/update/${user.id}`, userToUpdate, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response.content));
  }

  deleteUser(id: number): Observable<any> {
    return this.http
      .delete<ApiResponse<Boolean>>(`${this.url}/delete/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response.content));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.url}/detail/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      .pipe(map((response) => response.content));
  }

  resetPassword(id: String): Observable<String> {
    return this.http
      .post<ApiResponse<String>>(`${this.url}/reset-password/${id}`, null, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      })
      .pipe(map((response) => response.content));
  }

  checkUsernameExists(username: string): Observable<boolean> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    )
    const params = new HttpParams().set('username', username);
    return this.http
      .get<boolean>(`${this.url}/check-username`, {
        headers,
        params
      })
      .pipe(map((response) => response));
  }

  checkEmailExists(email: string): Observable<boolean> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    )
    const params = new HttpParams().set('email', email);
    return this.http
      .get<boolean>(`${this.url}/check-email`, {
        headers,
        params
      })
      .pipe(map((response) => response));
  }
}
