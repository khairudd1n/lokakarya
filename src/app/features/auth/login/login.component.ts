import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginResponse: ApiResponse<{ user: User; token: string }> = {} as ApiResponse<{ user: User; token: string }>;

  constructor(private authService: AuthService) { }

  ngOnInit(): void { 
    this.authService.login('JaneDoe', 'password').subscribe((data) => {
      this.loginResponse = data;
      console.log('Login Response:', this.loginResponse);
  });
  }
}
