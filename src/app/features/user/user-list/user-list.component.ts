import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { Table, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { AssSummaryService } from '../../../ass-summary.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [SharedModule, TableModule, CreateUserDialogComponent, ButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  users: any[] = [];

  filteredUsers: any[] = [];
  emailList: string[] = [];
  usernameList: string[] = [];

  totalRecords: number = 0;
  rows: number = 10;
  sortField: string = 'joinDate';
  sortOrder: string = 'desc';

  displayDialog: boolean = false;
  displayDetailDialog: boolean = false;
  selectedUser: any = null; // Holds data for the user being edited

  constructor(
    private userService: UserService,
    private assSummaryService: AssSummaryService
  ) {}

  ngOnInit(): void {
    this.loadPaginatedUsers("",0, 10, this.sortField, this.sortOrder);
  }

  loadUsersLazy(event: any): void {
    const page = event.first / event.rows;
    this.rows = event.rows;
    this.sortField = event.sortField || 'joinDate';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.userService
      .getPaginatedUser( "",page, this.rows, this.sortField, this.sortOrder)
      .subscribe((data) => {
        this.users = data.content;
        console.log("Received Data: ", this.users);
        this.totalRecords = data.page_info.totalElements;
      });
  }
  

  loadPaginatedUsers(searchTerm: string, page: number, size: number, sortBy: string, sortDirection: string) {
    this.userService
      .getPaginatedUser( searchTerm,page, size, sortBy, sortDirection)
      .subscribe((data) => {
        this.users = data.content;
        console.log("Received Data: ", this.users);
        this.totalRecords = data.page_info.totalElements;
      });
  }

  loadUsers() {
    this.userService.getAllUser().subscribe((data) => {
      this.users = data.map((user) => ({
        ...user,
        employee_status: user.employee_status === 1,
      }));
      this.filteredUsers = [...this.users];
      this.usernameList = this.users.map((user) => user.username.toLowerCase());
      this.emailList = this.users.map((user) =>
        user.email_address.toLowerCase()
      );
    });
  }

  openCreateDialog() {
    console.log('Opening create dialog');
    this.selectedUser = null;
    this.displayDialog = true;
  }

  openEditDialog(user: any) {
    this.selectedUser = user;
    this.displayDialog = true;
  }

  onUserSaved(user: any) {
    if (this.selectedUser) {
      // Compare each field and set to null if the value is unchanged
      if (user.employee_status == true) {
        user.employee_status = 1;
      }
      if (user.employee_status == false) {
        user.employee_status = 0;
      }
      user.enabled = Number(user.enabled);
      if (user.username === this.selectedUser.username) {
        user.username = null;
      }
      if (user.email_address === this.selectedUser.email_address) {
        user.email_address = null;
      }
      if (user.full_name === this.selectedUser.full_name) {
        user.full_name = null;
      }
      if (user.position === this.selectedUser.position) {
        user.position = null;
      }
      if (user.employee_status === this.selectedUser.employee_status) {
        user.employee_status = null;
      }
      if (user.join_date === this.selectedUser.join_date) {
        user.join_date = null;
      }
      if (user.enabled === this.selectedUser.enabled) {
        user.enabled = null;
      }
      if (user.division === this.selectedUser.division.id) {
        user.division = null;
      }
      if (areRoleEqual(user, this.selectedUser)) {
        user.selectedRoles = null;
      }
      console.log('Updated user data:', user);
      this.userService.updateUser(user).subscribe({
        next: (data) => {
          console.log('Updated : ', data);
          Swal.fire({
            title: 'Success!',
            text: 'User updated successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Update failed: ', err);
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to update user. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        },
      });
      // Call update API or handle the updated user data
    } else {
      console.log('User created : ', user);
      this.userService.saveUser(user).subscribe({
        next: (data) => {
          console.log('Saved : ', data);
          this.assSummaryService.generateAssSummary(
            data.id,
            new Date().getFullYear()
          ).subscribe();
          Swal.fire({
            title: 'Success!',
            text: 'User created successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
          this.assSummaryService
            .generateAssSummary(data.id, new Date().getFullYear())
            .subscribe();
          this.loadUsers();
        },
        error: (err) => {
          console.error('Creation failed: ', err);
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to create user. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        },
      });
    }
    this.displayDialog = false;
  }

  deleteUser(user: any) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete <strong>${user.full_name}</strong>.<br><br>
             This action will permanently remove them along with all associated information, 
             such as assessment summaries and related records.<br><br>
             <strong>This action cannot be undone.</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              `${user.full_name} has been deleted.`,
              'success'
            );
            this.loadUsers();
          },
          error: () => {
            Swal.fire(
              'Failed!',
              `Failed to delete ${user.full_name}.`,
              'error'
            );
          },
        });
      }
    });
  }

  onRowSelect(event: any) {
    this.displayDetailDialog = true;
    this.selectedUser = event.data;
    console.log('Selected user:', this.selectedUser);
  }

  clearSelectedUser() {
    this.selectedUser = null;
  }

  clearFilters(table: any): void {
    table.clear();
    const globalSearchInput = document.querySelector(
      '.p-input-icon-left input'
    ) as HTMLInputElement;
    if (globalSearchInput) {
      globalSearchInput.value = ''; // Clear the input field
    }
  }

  @ViewChild('dt1') dt1: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.loadPaginatedUsers(input, 0, this.rows, this.sortField, this.sortOrder);
    }
  }

  statusOptions: any[] = [
    { label: 'All', value: null },
    { label: 'Permanent', value: true },
    { label: 'Contract', value: false },
  ];
  selectedStatus: any = null;

  applyStatusFilter() {
    if (this.selectedStatus !== null) {
      this.filteredUsers = this.users.filter(
        (user) => user.employee_status === this.selectedStatus
      );
    } else {
      this.loadUsers();
    }
  }

  onDialogClose(visible: boolean) {
    console.log('On Dialog closed is called', visible);
    if (!visible) {
      console.log('Dialog closed');
      this.clearSelectedUser();
    }
  }
}

function areRoleEqual(user: any, selectedUser: any) {
  var oldRoles: string[] = selectedUser.role.map((role: any) => role.id);
  var newRoles: string[] = user.selectedRoles;

  oldRoles.sort();
  newRoles.sort();

  if (
    oldRoles.length === newRoles.length &&
    oldRoles.every((id, index) => id === newRoles[index])
  ) {
    return true;
  }
  return false;
}
