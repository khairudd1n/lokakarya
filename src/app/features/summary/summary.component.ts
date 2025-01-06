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

import { privateDecrypt, UUID } from 'crypto';
import { Division } from '../../core/models/division.model';
import { DivisionService } from '../../core/services/division.service';
import { EmpAchieveSkillDto } from '../../emp-achieve.service';
import { AuthService } from '../../core/services/auth.service';

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
  divisionOptions: { label: string; value: string }[] = [];
  displayDialog: boolean = false;
  displayDetailDialog: boolean = false;
  displaySummaryDialog: boolean = false;
  selectedUser: any = null;
  currentYear: number = new Date().getFullYear();
  selectedYear: { label: string; value: number } = {
    label: this.currentYear.toString(),
    value: this.currentYear,
  };
  years: { label: string; value: number }[] = [];
  assSummary: any[] = [];
  userSummaryList: any[] = [];
  isApproving: { [key: string]: boolean } = {};
  roles: any[] = [];
  loginUser: any;
  statusOptions: { label: string; value: number }[] = [
    { label: 'Pending', value: 0 },
    { label: 'Approved', value: 1 },
  ];
  status: number[] = [];
  selectedStatus: boolean | null = null;

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

  totalRecords: number = 0;
  rows: number = 10;
  sortField: string = 'id';
  sortOrder: string = 'asc';

  selectedDivision: any[] = [];

  constructor(
    private assSummaryService: AssSummaryService,
    private divisionSummary: DivisionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtPayload = this.authService.parseJwt(token);
      this.roles = jwtPayload.roles!;
      
    }
    this.loginUser = JSON.parse(localStorage.getItem('user')!);
    
    this.divisionSummary.getDivisionList().subscribe((data) => {
      this.divisionOptions = data.map((division) => {
        return { label: division.division_name, value: division.id };
      });
    });
    if (this.roles.includes('HR')) {
      this.getPaginatedAssessmentSummaries(
        '',
        this.selectedYear.value,
        [],
        null,
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    } else {
      this.selectedDivision = [this.loginUser.division.id];
      
      this.getPaginatedAssessmentSummaries(
        '',
        this.selectedYear.value,
        this.selectedDivision,
        null,
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    }
  }

  onYearChange($event: DropdownChangeEvent) {
    this.clearFilters(this.dt1);
    this.getPaginatedAssessmentSummaries(
      '',
      $event.value.value,
      [],
      null,
      0,
      this.rows,
      this.sortField,
      this.sortOrder
    );
  }

  loadAssSumLazy(event: any) {
    const page = event.first / event.rows;
    const searchTerm = event.globalFilter || '';
    this.rows = event.rows;
    this.sortField = event.sortField || 'id';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.getPaginatedAssessmentSummaries(
      searchTerm,
      this.selectedYear.value,
      this.selectedDivision,
      this.selectedStatus,
      page,
      this.rows,
      this.sortField,
      this.sortOrder
    );
  }

  openSummaryDialog() {
    this.displaySummaryDialog = true;
    
  }

  getPaginatedAssessmentSummaries(
    searchTerm: string,
    year: number,
    division: string[],
    approved: boolean | null,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ) {
    this.assSummaryService
      .getPaginatedAssSummary(
        searchTerm,
        year,
        division,
        approved,
        page,
        size,
        sortBy,
        sortDirection
      )
      .subscribe((data) => {
        this.assSummary = data.content.assess_sums;
        

        this.totalRecords = data.page_info.totalElements;

        this.years = data.content.years.map((year: number) => ({
          label: year.toString(),
          value: year,
        }));
      });
  }

  onRowSelect(event: any) {
    this.selectedUser = event.data;
    this.openSummaryDialog();
  }

  clearSelectedUser() {
    this.selectedUser = null;
    this.getPaginatedAssessmentSummaries(
      '',
      this.selectedYear.value,
      this.selectedDivision,
      this.selectedStatus,
      0,
      this.rows,
      this.sortField,
      this.sortOrder
    );
  }

  clearFilters(table: any): void {
    table.reset();
    this.selectedDivision = [];
    this.selectedStatus = null;
    this.status = [];
    const globalSearchInput = document.querySelector(
      '.p-input-icon-left input'
    ) as HTMLInputElement;
    if (globalSearchInput) {
      globalSearchInput.value = '';
    }
  }

  @ViewChild('dt1') dt1: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.getPaginatedAssessmentSummaries(
        input,
        this.selectedYear.value,
        this.selectedDivision,
        this.selectedStatus,
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    }
  }

  filterDivision(selectedValues: any[]) {
    
    if (this.dt1) {
      this.getPaginatedAssessmentSummaries(
        '',
        this.selectedYear.value,
        selectedValues,
        this.selectedStatus,
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    }
  }
  filterStatus(selectedStatus: any) {
    console.log('Filter called with:', selectedStatus);
    if (this.dt1) {
      if(selectedStatus.length > 1) selectedStatus = null
      this.selectedStatus = this.status.length > 1 ? null : selectedStatus;
      this.getPaginatedAssessmentSummaries(
        '',
        this.selectedYear.value,
        this.selectedDivision,
        selectedStatus,
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    }
  }

  onDialogClose(visible: boolean) {
    
    if (!visible) {
      
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
        this.isApproving[id] = true;

        this.assSummaryService.updateAssessSumStatusToApprove(id).subscribe(
          (response) => {
            
            Swal.fire({
              icon: 'success',
              title: 'Approved!',
              text: 'The assessment summary has been approved successfully.',
              confirmButtonText: 'OK',
            });
            this.getPaginatedAssessmentSummaries(
              '',
              this.selectedYear.value,
              this.selectedDivision,
              this.selectedStatus,
              0,
              this.rows,
              this.sortField,
              this.sortOrder
            );
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
            this.isApproving[id] = false;
          }
        );
      }
    });
  }

  unapproveAssessmentSummary(id: string) {
    if (this.isApproving[id]) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to unapprove this assessment summary. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unapprove it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isApproving[id] = true;

        this.assSummaryService.updateAssessSumStatusToUnapprove(id).subscribe(
          (response) => {
            
            Swal.fire({
              icon: 'success',
              title: 'Unapproved!',
              text: 'The assessment summary has been unapproved successfully.',
              confirmButtonText: 'OK',
            });
            this.getPaginatedAssessmentSummaries(
              '',
              this.selectedYear.value,
              this.selectedDivision,
              this.selectedStatus,
              0,
              this.rows,
              this.sortField,
              this.sortOrder
            );
          },
          (error) => {
            console.error('Error updating status:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to unapprove the assessment summary. Please try again.',
              confirmButtonText: 'OK',
            });
          },
          () => {
            this.isApproving[id] = false;
          }
        );
      }
    });
  }
}
