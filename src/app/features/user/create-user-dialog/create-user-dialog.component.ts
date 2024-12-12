import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { User } from '../../../core/models/user.model';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/role.model';
import { CheckboxModule } from 'primeng/checkbox';
import { Division } from '../../../core/models/division.model';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { DivisionService } from '../../../core/services/division.service';
import { UserService } from '../../../core/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    SharedModule,
    ButtonModule,
    CommonModule,
    InputTextModule,
    FormsModule,
    DialogModule,
    CheckboxModule,
    DropdownModule,
    ToggleButtonModule,
  ],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.css',
})
export class CreateUserDialogComponent implements OnChanges {
  @Input() visible: boolean = false; 
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() userSaved: EventEmitter<any> = new EventEmitter(); 

  @Input() userData: any = null; 

  roles: Role[] = [];
  divisions: any[] = [];

  constructor(
    private roleService: RoleService,
    private divisionService: DivisionService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.roleService.getAllRole().subscribe((response) => {
      this.roles = response;
    });
    this.divisionService.getAllDivisions().subscribe((response) => {
      this.divisions = response;
    });
    if (!this.user.selectedRoles) {
      this.user.selectedRoles = []; 
    }
    console.log(this.divisions);
  }

  user: any = {
    username: '',
    email: '',
    password: '',
    full_name: '',
    position: '',
    employee_status: '',
    join_date: '',
    enabled: '',
    selectedRoles: [],
    division: '',
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userData']) {
      if (this.userData) {
        // Editing an existing user
        console.log("user data : ",this.userData);
        this.user = { ...this.userData };
        this.user.selectedRoles =
          this.userData.role?.map((role: any) => role.id) || [];
        this.user.division = this.userData.division?.id || '';
        this.user.password = null; 
        this.user.employee_status? this.setEmployeeStatus(1) : this.setEmployeeStatus(0);
      } else {
        // Creating a new user
        this.resetForm();
        this.user.enabled = true;
        this.setEmployeeStatus(0);
      }
    }
  }

  saveUser() {
    this.userSaved.emit(this.user); 
    console.log(this.user);
    this.closeDialog();
  }

  closeDialog() {
    this.visibleChange.emit(false); 
    this.resetForm();
  }

  resetForm() {
    if (!this.userData) {
      this.user = {
        username: '',
        email: '',
        password: '',
        full_name: '',
        position: '',
        employee_status: '',
        join_date: '',
      };
    }
  }

  // Check if a role is selected
  isSelected(roleId: string): boolean {
    return this.user.selectedRoles.includes(roleId);
  }

  setEmployeeStatus(status: number): void {
    this.user.employee_status = status;
  }

  resetPassword() {
    this.userService.resetPassword(this.user.id).subscribe((response) => {
      console.log(response);
      Swal.fire({
        title: 'Success',
        text: 'New Password : ' + response,
        icon: 'success',
        customClass: {
          popup: 'my-swal-popup'
        }
      })
    })
  }
}
