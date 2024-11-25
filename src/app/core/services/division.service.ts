import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Division } from '../models/division.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DivisionService {

  url: string = 'http://localhost:8080/division';
  token: string = localStorage.getItem('token') || '';

  constructor(readonly http: HttpClient) { }

  getAllDivision(): Observable<Division[]> {
    return this.http.get<Division[]>(`${this.url}`, { headers: { Authorization: `Bearer ${this.token}` } }).pipe(
      map((response) => response) // Extract content array
    );
  }
}
