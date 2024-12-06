import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import Swal from 'sweetalert2';
import { UserSummaryComponent } from "../../user-summary/user-summary.component";

@Component({
  selector: 'app-view-user-list',
  standalone: true,
  imports: [SharedModule, TableModule, ButtonModule, UserSummaryComponent],
  templateUrl: './view-user-list.component.html',
  styleUrl: './view-user-list.component.css'
})
export class ViewUserListComponent implements OnInit {

  users: any[] = [];

  filteredUsers: any[] = [];

  displayDialog: boolean = false;
  displayDetailDialog: boolean = false;
  displaySummaryDialog: boolean = false;
  selectedUser: any = null; // Holds data for the user being edited

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  openSummaryDialog() {
    this.displaySummaryDialog = true;
    console.log(this.selectedUser.id);
  }

  loadUsers() {
    this.userService.getAllUser().subscribe((data) => {
      this.users = data.map(user => ({
        ...user,
        employee_status: user.employee_status === 1 // Convert 1 to true and 0 to false
      }));
      this.filteredUsers = [...this.users];
      console.log(this.users);
    });
  }

  onRowSelect(event: any) {
    this.displayDetailDialog = true;
    this.selectedUser = event.data;
    console.log('Selected user:', this.selectedUser);
  }

  clearSelectedUser() {
    this.selectedUser = null; // Clear selected user when dialog is closed
  }

  clearFilters(table: any): void {
    table.clear();
  }

  @ViewChild('dt1') dt1: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.dt1.filterGlobal(input, 'contains');  // Pass the input value and match mode
    }
  }

  statusOptions: any[] = [
    { label: 'All', value: null },
    { label: 'Permanent', value: true },
    { label: 'Contract', value: false }
  ];
  selectedStatus: any = null;

  applyStatusFilter() {
    if (this.selectedStatus !== null) {
      // Apply the filter based on selected status
      this.filteredUsers = this.users.filter(user => user.employee_status === this.selectedStatus);
    } else {
      // If "All" is selected, show all users
      this.loadUsers(); // Re-fetch all users
    }
  }

  onDialogClose(visible: boolean) {
    console.log('On Dialog closed is called', visible);
    if (!visible){
      console.log('Dialog closed');
      this.clearSelectedUser(); // Clear the selected user when dialog is closed
    }
  }
}
