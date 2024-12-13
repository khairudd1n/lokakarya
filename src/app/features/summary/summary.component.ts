import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { SharedModule } from '../../shared/primeng/shared/shared.module';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { UserSummaryComponent } from '../user-summary/user-summary.component';
import { AssSummaryService } from '../../ass-summary.service';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    SharedModule,
    TableModule,
    ButtonModule,
    UserSummaryComponent,
    MultiSelectModule,
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent {
  users: any[] = [];
  filteredUsers: any[] = [];
  divisionOptions: any[] = [];
  displayDialog: boolean = false;
  displayDetailDialog: boolean = false;
  displaySummaryDialog: boolean = false;
  selectedUser: any = null;
  selectedYear: { label: string; value: number } = {
    label: '2024',
    value: 2024,
  };
  years: { label: string; value: number }[] = [

  ];

  constructor(
    private userService: UserService,
    private assSummaryService: AssSummaryService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  onYearChange($event: DropdownChangeEvent) {
    this.loadUsers();
  }

  prepareDivisionOptions() {
    this.divisionOptions = this.filteredUsers
      .map((user) => ({
        label: user.division.division_name,
        value: user.division.division_name,
      }))
      .filter(
        (option, index, self) =>
          index === self.findIndex((t) => t.value === option.value)
      );
  }

  openSummaryDialog() {
    this.displaySummaryDialog = true;
    console.log(this.selectedUser.id);
  }

  loadUsers() {
    this.userService.getAllUser().subscribe((data) => {
      this.users = data.map((user) => ({
        ...user,
        employee_status: user.employee_status === 1,
      }));
      this.filteredUsers = [...this.users];
      this.fetchAssessmentSummaries();
    });
  }
  fetchAssessmentSummaries() {
    this.assSummaryService.getAllAssSummary().subscribe((data) => {
      console.log('Assessment Summary:', data);
  
      // Extract unique years for the dropdown
      const uniqueYears = Array.from(
        new Set(data.content.map((assSummary) => assSummary.year))
      ).sort((a, b) => b - a);
  
      this.years = uniqueYears.map((year) => ({ label: year.toString(), value: year }));
      console.log('Updated Years:', this.years);
  
      // Filter based on the selected year (default: all years)
      const filteredContent = this.selectedYear
        ? data.content.filter((assSummary) => assSummary.year === this.selectedYear.value)
        : data.content;
  
      console.log('Filtered Assessment Summary:', filteredContent);
  
      // Map filtered content to user IDs and scores
      const userScoresMap = new Map(
        filteredContent.map((assSummary) => [
          assSummary.user.id,
          assSummary.score,
        ])
      );
  
      this.filteredUsers = this.users
        .filter((user) => userScoresMap.has(user.id))
        .map((user) => ({
          ...user,
          assessmentScore: userScoresMap.get(user.id),
        }));
  
      console.log('Filtered Users:', this.filteredUsers);
  
      this.prepareDivisionOptions();
    });
  }
  

  onRowSelect(event: any) {
    this.selectedUser = event.data;
    this.openSummaryDialog();
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

  filterDivision(selectedValues: any[]) {
    console.log('Filter called with:', selectedValues);

    if (!selectedValues || selectedValues.length === 0) {
      this.filteredUsers = [...this.users]; // Show all users if no division is selected
      return;
    }

    const selectedDivisionValues = selectedValues.map(
      (selected) => selected
    );

    this.filteredUsers = this.users
    .filter((user) =>
      selectedDivisionValues.includes(user.division?.division_name || 'Unknown')
    )
    .map((user) => {
      const score = this.filteredUsers.find((u) => u.id === user.id)?.assessmentScore;
      return { ...user, assessmentScore: score };
    });

  console.log('Filtered Users:', this.filteredUsers);
}

  onDialogClose(visible: boolean) {
    console.log('On Dialog closed is called', visible);
    if (!visible) {
      console.log('Dialog closed');
      this.clearSelectedUser();
    }
  }
}