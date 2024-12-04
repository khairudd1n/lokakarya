import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url: string = 'http://localhost:8080/auth';

  constructor(readonly http: HttpClient) { }

  login(username: string, password: string): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.url}/login`, { username, password }); 
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if the token is expired and return null if expired
  checkTokenExpiration(): string | null {
    const token = this.getToken();
    
    if (token) {
        const decodedToken = this.parseJwt(token);
        const expirationTime = decodedToken.exp * 1000; // exp is in seconds, multiply by 1000 to get milliseconds
        const currentTime = Date.now();

        // Check if the token is expired
        if (currentTime > expirationTime) {
            // Token is expired, remove it and return null
            this.logout();
            return null;
        }
        return token;
    }
    return null;
  }

  // Log the user out by removing the token and redirecting to login
  logout(): void {
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';  // Replace with your actual login URL
  }

  parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }
}
