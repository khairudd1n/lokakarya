import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { Menu } from '../models/menu.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  url: string = 'http://localhost:8080/menu'
  token: string = localStorage.getItem('token') || ''

  constructor(readonly http: HttpClient) { }

  getAllMenu(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.url}`, { headers: { Authorization: `Bearer ${this.token}` } });
  }

  getMenuByUserId(userId: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.url}/user/${userId}`, { headers: { Authorization: `Bearer ${this.token}` } }).pipe(
      map((response) => response) // Extract content array
    );
  }
}
