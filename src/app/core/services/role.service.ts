import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Role } from '../models/role.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  url: string = 'http://localhost:8080/role'
  token: string = localStorage.getItem('token') || ''

  constructor(readonly http: HttpClient) { }

  getAllRole(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.url}/all`, { headers: { Authorization: `Bearer ${this.token}` } }).pipe(
      map((response) => response.content) // Extract content array
    );
  }

}
