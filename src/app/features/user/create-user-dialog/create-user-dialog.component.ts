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
  @Input() usernameList: string[] = [];
  @Input() emailList: string[] = [];

  roles: Role[] = [];
  divisions: any[] = [];
  takenEmails: string[] = [];
  takenUsernames: string[] = [];
  emailValid: boolean = false;
  usernameValid: boolean = false;

  isFormValid: boolean = false;

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
    this.takenEmails = this.emailList;
    this.takenUsernames = this.usernameList;
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
        console.log('user data : ', this.userData);
        this.user = { ...this.userData };
        this.user.selectedRoles =
          this.userData.role?.map((role: any) => role.id) || [];
        this.user.division = this.userData.division?.id || '';
        this.user.password = null;
        this.user.employee_status
          ? this.setEmployeeStatus(1)
          : this.setEmployeeStatus(0);
        this.takenEmails = this.emailList.filter(
          (email) => email !== this.user.email_address
        );
        this.takenUsernames = this.usernameList.filter(
          (username) => username !== this.user.username.toLowerCase()
        );
      } else {
        this.takenEmails = this.emailList;
        this.takenUsernames = this.usernameList;
        this.resetForm();
        this.user.enabled = true;
        this.setEmployeeStatus(0);
      }
    } else {
      this.takenEmails = this.emailList;
      this.takenUsernames = this.usernameList;
      this.user.enabled = true;
      this.setEmployeeStatus(0);
    }
  }

  saveUser() {
    this.userSaved.emit(this.user);
    console.log(this.user);
    this.closeDialog();
  }

  isUsernameTaken(username: string): boolean {
    this.usernameValid = !this.takenUsernames.includes(username.toLowerCase());
    return !this.usernameValid; // return true if username is taken, false if not
  }

  isEmailTaken(email: string): boolean {
    this.emailValid = !this.takenEmails.includes(email.toLowerCase());
    return !this.emailValid;
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
          popup: 'my-swal-popup',
        },
      });
    });
  }
}
