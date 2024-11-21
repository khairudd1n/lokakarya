import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url: string = 'http://localhost:8080/user';

  constructor(readonly http: HttpClient) { }

  getAllUser(): Observable<User[]> {

    return this.http.get<ApiResponse<User[]>>(`${this.url}/all`).pipe(
      map((response) => response.content) // Extract content array
    );
  }
}
