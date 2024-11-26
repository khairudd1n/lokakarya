import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CreateUserDialogComponent } from '../create-user-dialog/create-user-dialog.component';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [SharedModule, TableModule, CreateUserDialogComponent, ButtonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  users: User[] = [];

  displayDialog: boolean = false;
  selectedUser: any = null; // Holds data for the user being edited

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUser().subscribe((data) => {
      this.users = data;
    });
  }

  openCreateDialog() {
    this.selectedUser = null; // Clear selected user for creating a new one
    this.displayDialog = true;
  }

  openEditDialog(user: any) {
    this.selectedUser = user; // Pass the selected user for editing
    this.displayDialog = true;
  }

  onUserSaved(user: any) {
    if (this.selectedUser) {
      // Compare each field and set to null if the value is unchanged
      if(user.employee_status == true){
        user.employee_status = 1;
      }
      if(user.employee_status == false){
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
          Swal.fire({
            title: 'Success!',
            text: 'User created successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
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
      text: `You are about to delete ${user.full_name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call your service to delete the user
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            Swal.fire('Deleted!', `${user.full_name} has been deleted.`, 'success');
            this.loadUsers();
          },
          error: () => {
            Swal.fire('Failed!', `Failed to delete ${user.full_name}.`, 'error');
          },
        });
      }
    });
  }
}

function areRoleEqual(user: any, selectedUser: any) {
  // Extract role ids from both users
  var oldRoles: string[] = selectedUser.role.map((role: any) => role.id);
  var newRoles: string[]= user.selectedRoles;

  // Sort both arrays (optional: you can use any sorting method if you want a specific order)
  oldRoles.sort();
  newRoles.sort();
  // Compare the arrays by checking their length and each element
  if (oldRoles.length === newRoles.length && oldRoles.every((id, index) => id === newRoles[index])) {
    return true;
  }
  return false;
}
