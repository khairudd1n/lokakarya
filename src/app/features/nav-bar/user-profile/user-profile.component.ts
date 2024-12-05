import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { TabViewModule } from 'primeng/tabview';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [SharedModule, TabViewModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent  {

  selectedTab = 'profile'; // Default tab
  passwordForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      console.log('Password changed:', this.passwordForm.value);
    }
  }

}
