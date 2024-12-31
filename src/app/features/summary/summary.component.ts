import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { SharedModule } from '../../shared/primeng/shared/shared.module';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { UserSummaryComponent } from '../user-summary/user-summary.component';
import { AssSummaryService } from '../../ass-summary.service';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { privateDecrypt, UUID } from 'crypto';
import { Division } from '../../core/models/division.model';
import { DivisionService } from '../../core/services/division.service';

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
  divisionOptions: { label: string; value: string }[] = [];
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

  totalRecords: number = 0;
  rows: number = 10;
  sortField: string = 'id';
  sortOrder: string = 'asc';

  selectedDivision: any[] = [];

  constructor(
    private assSummaryService: AssSummaryService,
    private divisionSummary: DivisionService
  ) {}

  ngOnInit(): void {
    this.divisionSummary.getDivisionList().subscribe((data) => {
      this.divisionOptions = data.map((division) => {
        return { label: division.division_name, value: division.id };
      });
    });
    this.fetchAssessmentSummaries();
  }

  onYearChange($event: DropdownChangeEvent) {
    this.clearFilters(this.dt1);
    this.getPaginatedAssessmentSummaries(
      '',
      $event.value.value,
      '',
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
      '',
      page,
      this.rows,
      this.sortField,
      this.sortOrder
    );
  }

  openSummaryDialog() {
    this.displaySummaryDialog = true;
    console.log('Selected User ID:', this.selectedUser.id);
  }

  getPaginatedAssessmentSummaries(
    searchTerm: string,
    year: number,
    division: string,
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
        page,
        size,
        sortBy,
        sortDirection
      )
      .subscribe((data) => {
        this.assSummary = data.content.assess_sums;
        console.log('Assessment Summary:', this.assSummary);

        this.totalRecords = data.page_info.totalElements;

        this.years = data.content.years.map((year: number) => ({
          label: year.toString(),
          value: year,
        }));
      });
  }

  fetchAssessmentSummaries() {
    this.assSummaryService.getAllAssSummary().subscribe((data) => {
      this.assSummary = data.content.assess_sums;
      console.log('Assessment Summary:', this.assSummary);

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
  }

  clearFilters(table: any): void {
    table.reset();
    this.selectedDivision = [];
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
      this.getPaginatedAssessmentSummaries(
        input,
        this.selectedYear.value,
        '',
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    }
  }

  filterDivision(selectedValues: any[]) {
    console.log('Filter called with:', selectedValues);
    if (this.dt1) {
      this.getPaginatedAssessmentSummaries(
        '',
        this.selectedYear.value,
        selectedValues[0],
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
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
