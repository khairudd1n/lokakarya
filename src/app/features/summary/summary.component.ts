import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { SharedModule } from '../../shared/primeng/shared/shared.module';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { UserSummaryComponent } from '../user-summary/user-summary.component';
import { AssSummaryService } from '../../ass-summary.service';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import Swal from 'sweetalert2';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    SharedModule,
    TableModule,
    ButtonModule,
    UserSummaryComponent,
    MultiSelectModule,
    TagModule,
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
  years: { label: string; value: number }[] = [];
  assSummary: any[] = [];
  userSummaryList: any[] = [];
  isApproving: { [key: string]: boolean } = {};

  getStatusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved';
      default:
        return 'Unknown';
    }
  }

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
    this.divisionOptions = this.filteredUsers.map(
      (user) => user.division.division_name
    );

    this.divisionOptions = Array.from(new Set(this.divisionOptions));

    console.log('divisi : ', this.divisionOptions);
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

      this.assSummary = data.content;

      const uniqueYears = Array.from(
        new Set(this.assSummary.map((assSummary) => assSummary.year))
      ).sort((a, b) => b - a);

      this.years = uniqueYears.map((year) => ({
        label: year.toString(),
        value: year,
      }));
      console.log('Updated Years:', this.years);

      const filteredContent = this.selectedYear
        ? this.assSummary.filter(
            (assSummary) => assSummary.year === this.selectedYear.value
          )
        : this.assSummary;

      console.log('Filtered Assessment Summary:', filteredContent);

      const userScoresMap = new Map(
        filteredContent.map((assSummary) => [
          assSummary.user.id,
          assSummary.score,
        ])
      );

      this.userSummaryList = this.users
        .filter((user) => userScoresMap.has(user.id))
        .map((user) => ({
          ...user,
          assessmentScore: userScoresMap.get(user.id),
          assessmentSummaryId: this.assSummary.find(
            (ass) => ass.user.id === user.id
          )?.id,
          assessmentStatus: this.assSummary.find(
            (ass) => ass.user.id === user.id
          )?.status,
        }));

      this.filteredUsers = this.userSummaryList;

      console.log('Filtered Users:', this.userSummaryList);

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
      this.filteredUsers = [...this.userSummaryList]; // Show all users if no division is selected
      return;
    }

    const selectedDivisionValues = selectedValues.map((selected) => selected);

    this.filteredUsers = this.userSummaryList
      .filter((user) =>
        selectedDivisionValues.includes(
          user.division?.division_name || 'Unknown'
        )
      )
      .map((user) => {
        const score = this.filteredUsers.find(
          (u) => u.id === user.id
        )?.assessmentScore;
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

  approveAssessmentSummary(id: string) {
    if (this.isApproving[id]) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to approve this assessment summary. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isApproving[id] = true; // Mark as approving

        this.assSummaryService.updateAssessSumStatusToApprove(id).subscribe(
          (response) => {
            console.log('Successfully updated status:', response);
            Swal.fire({
              icon: 'success',
              title: 'Approved!',
              text: 'The assessment summary has been approved successfully.',
              confirmButtonText: 'OK',
            });
            this.fetchAssessmentSummaries();
          },
          (error) => {
            console.error('Error updating status:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to approve the assessment summary. Please try again.',
              confirmButtonText: 'OK',
            });
          },
          () => {
            this.isApproving[id] = false; // Reset state after completion
          }
        );
      }
    });
  }
}
