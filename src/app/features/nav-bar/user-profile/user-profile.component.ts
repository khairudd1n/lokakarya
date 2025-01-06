import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { TabViewModule } from 'primeng/tabview';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [SharedModule, TabViewModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  onLogout() {
    this.authService.logout();
  }

  selectedTab = 'profile';
  passwordForm?: FormGroup;
  userId: string = '';
  token: string = '';
  user: any;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.token = localStorage.getItem('token') || '';
    this.userId = this.authService.parseJwt(this.token).sub || '';

    this.userService.getUserById(this.userId).subscribe((data) => {
      this.user = data;
      console.log(this.user);
    });
  }

  ngOnInit(): void {
    this.passwordForm = new FormGroup(
      {
        currentPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
      },
      {
        validators: Validators.compose([
          this.passwordsDiffer,
          this.passwordsMatch,
        ]),
      }
    );
  }

  passwordsDiffer(group: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = group as FormGroup;
    const newPassword = formGroup.get('newPassword')?.value;
    const oldPassword = formGroup.get('currentPassword')?.value;
    return newPassword === oldPassword ? { samePassword: true } : null;
  }

  passwordsMatch(group: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = group as FormGroup;
    const newPassword = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { noMatch: true };
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onChangePassword(): void {
    if (this.passwordForm!.valid) {
      const currentPassword = this.passwordForm!.value.currentPassword;
      const newPassword = this.passwordForm!.value.newPassword;
      const confirmPassword = this.passwordForm!.value.confirmPassword;

      console.log('Password changed:', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      this.authService
        .changePassword(this.userId, currentPassword, newPassword)
        .subscribe(
          (data) => {
            console.log(data);
            this.passwordForm!.reset();
            Swal.fire({
              title: 'Success!',
              text: 'Password changed successfully.',
              icon: 'success',
              confirmButtonColor: '#3085d6',
            });
          },
          (error) => {
            let message = 'Failed to change password';

            if (error.error.info.detailMessage.includes('Incorrect password')) {
              message = 'Incorrect password';
            }
            Swal.fire({
              title: 'Failed!',
              text: message,
              icon: 'error',
              confirmButtonColor: '#d33',
            });
          }
        );
    } else {
      console.log('Form is invalid');
    }
  }
}
