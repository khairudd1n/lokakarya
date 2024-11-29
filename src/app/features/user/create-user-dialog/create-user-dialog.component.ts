import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { User } from '../../../core/models/user.model';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/role.model';
import {CheckboxModule} from 'primeng/checkbox';
import { Division } from '../../../core/models/division.model';
import { DivisionService } from '../../../core/services/division.service';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule} from 'primeng/togglebutton';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [SharedModule, ButtonModule, CommonModule, 
    InputTextModule, FormsModule, DialogModule, CheckboxModule, 
    DropdownModule, ToggleButtonModule],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.css'
})
export class CreateUserDialogComponent implements OnChanges {
  @Input() visible: boolean = false; // To control dialog visibility
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() userSaved: EventEmitter<any> = new EventEmitter(); // Emit when user is saved (create or edit)

  @Input() userData: any = null; // Input for editing a user

  roles: Role[] = [];
  divisions: Division[] = [];

  constructor(private roleService: RoleService, private divisionService: DivisionService) {}

  ngOnInit() {
    this.roleService.getAllRole().subscribe((response) => {
      this.roles = response;
    });
    this.divisionService.getAllDivision().subscribe((response) => {
      this.divisions = response;
    })
    if (!this.user.selectedRoles) {
      this.user.selectedRoles = [];  // Ensure selectedRoles is initialized
    }
    console.log(this.divisions);
  }

  user: any = { username: '', email: '', password: '', full_name: '', 
    position: '', employee_status: '', join_date: '', enabled: '', selectedRoles: [], division: '' };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      if (this.userData) {
        // Editing an existing user
        this.user = { ...this.userData };
        this.user.selectedRoles = this.userData.role?.map((role: any) => role.id) || [];
        this.user.division = this.userData.division?.id || '';
        this.user.password = null; // Do not prepopulate the password
      } else {
        // Creating a new user
        this.resetForm();
      }
    }
  }

  saveUser() {
    this.userSaved.emit(this.user); // Emit user data for saving (create or edit)
    console.log(this.user);
    this.closeDialog();
  }

  closeDialog() {
    this.visibleChange.emit(false); // Notify parent to close the dialog
    this.resetForm();
  }

  resetForm() {
    if (!this.userData) {
      this.user = { username: '', email: '', password: '', full_name: '', position: '', employee_status: '', join_date: '' };
    }
  }  

  // Check if a role is selected
  isSelected(roleId: string): boolean {
    return this.user.selectedRoles.includes(roleId);
  }

  setEmployeeStatus(status: number): void {
    this.user.employee_status = status;
  }
}
