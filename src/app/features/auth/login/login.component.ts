import { Component } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginResponse: ApiResponse<{ user: User; token: string }> =
    {} as ApiResponse<{ user: User; token: string }>;

  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.username && this.password) {
      this.authService.login(this.username, this.password).subscribe(
        (response) => {
          localStorage.setItem('token', response.content.token);
          localStorage.setItem('user', JSON.stringify(response.content.user));
          console.log('Login successful:', response);
          this.router.navigate(['/user-profile']);
        },
        (error) => {
          this.onLoginError();
          console.error('Login failed:', error);
        }
      );
    }
  }
  onLoginError() {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: 'Invalid username or password',
      showConfirmButton: false,
      timer: 3000,
      toast: true,
      background: '#f8d7da',
      color: '#721c24',
      timerProgressBar: true,
    });
  }
}
