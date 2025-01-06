import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { UserSummaryComponent } from '../../user-summary/user-summary.component';

@Component({
  selector: 'app-view-user-list',
  standalone: true,
  imports: [SharedModule, TableModule, ButtonModule, UserSummaryComponent],
  templateUrl: './view-user-list.component.html',
  styleUrl: './view-user-list.component.css',
})
export class ViewUserListComponent implements OnInit {
  users: any[] = [];

  filteredUsers: any[] = [];

  displayDialog: boolean = false;
  displayDetailDialog: boolean = false;
  displaySummaryDialog: boolean = false;
  selectedUser: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUser().subscribe((data) => {
      this.users = data.map((user) => ({
        ...user,
        employee_status: user.employee_status === 1,
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
    this.selectedUser = null;
  }

  clearFilters(table: any): void {
    table.clear();
  }

  @ViewChild('dt1') dt1: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.dt1.filterGlobal(input, 'contains');
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
