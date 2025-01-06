import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = 'http://localhost:8080/auth';

  constructor(readonly http: HttpClient) {}

  login(
    username: string,
    password: string
  ): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(
      `${this.url}/login`,
      { username, password }
    );
  }

  changePassword(
    userId: string,
    currentPassword: any,
    newPassword: any
  ): Observable<ApiResponse<User>> {
    const reqData = {
      old_password: currentPassword,
      new_password: newPassword,
    };

    const token = this.getToken();

    return this.http.patch<ApiResponse<User>>(
      `${this.url}/change-password/${userId}`,
      reqData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  checkTokenExpiration(): string | null {
    const token = this.getToken();

    console.log('Token:', token);

    if (token) {
      const decodedToken = this.parseJwt(token);
      const expirationTime = decodedToken.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
        console.log('Token is expired');
        this.logout();
        return null;
      }
      return token;
    }
    return null;
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

  parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}
