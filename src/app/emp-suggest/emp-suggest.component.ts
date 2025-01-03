import { Component, OnInit } from '@angular/core';
import { EmpSuggestService, EmpSuggestDto } from '../emp-suggest.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table'; // For table
import { InputNumberModule } from 'primeng/inputnumber'; // For number input
import { ButtonModule } from 'primeng/button';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';
import { AssSummaryService } from '../ass-summary.service';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-emp-suggest',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    FormsModule,
    NavBarComponent,
    TagModule,
  ],
  templateUrl: './emp-suggest.component.html',
  styleUrls: ['./emp-suggest.component.css'],
})
export class EmpSuggestComponent implements OnInit {
  groupData: any[] = [];
  userId: string = '';
  assessmentYear: number = new Date().getFullYear();
  selectedSuggest: EmpSuggestDto[] = [];
  assessmentYears: number[] = []; // Array untuk menampung tahun
  selectedAssessmentYear: number = new Date().getFullYear(); // Tahun yang dipilih
  isPreviousYearSelected: boolean = false;

  editedSuggests: Set<string> = new Set(); // Menyimpan ID skill yang telah diedit
  isDisabled: boolean = false;

  constructor(
    private empSuggestService: EmpSuggestService,
    private assSummaryService: AssSummaryService
  ) {}

  ngOnInit(): void {
    this.getUserId();
    this.initializeGroupData();
    this.loadSavedSuggestions();
    this.initializeAssessmentYears(); // Panggil fungsi untuk menginisialisasi tahun
  }

  initializeAssessmentYears(): void {
    this.empSuggestService.getAssessmentYears().subscribe(
      (years) => {
        if (years.length > 0) {
          this.assessmentYears = years;
        } else {
          this.assessmentYears = [new Date().getFullYear()];
        }
        if (!this.assessmentYears.includes(this.selectedAssessmentYear)) {
          this.selectedAssessmentYear = this.assessmentYears[0];
        }
      },
      (error) => {
        console.error('Error fetching assessment years:', error);
      }
    );
  }

  onAssessmentYearChange(): void {
    this.isPreviousYearSelected =
      this.selectedAssessmentYear < this.assessmentYear;
    this.loadSavedSuggestions(); // Panggil ulang data ketika tahun berubah
  }

  getUserId(): void {
    const userToken = localStorage.getItem('token');

    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1])); // Decode JWT payload
        this.userId = payload.sub;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found in localStorage.');
    }
  }

  initializeGroupData(): void {
    this.groupData = [{ rows: [{ suggestion: '', id: '' }] }];
  }

  loadSavedSuggestions(): void {
    this.empSuggestService
      .getEmpSuggestByUserIdAndYear(this.userId, this.selectedAssessmentYear)
      .subscribe(
        (data) => {
          this.groupData[0].rows = data.map((item) => ({
            suggestion: item.suggestion,
            id: item.id,
            saved: true, // Tandai sebagai data tersimpan
          }));

          // Call getAssessmentSummary after loading suggestions
          this.assSummaryService
            .getAssessmentSummary(this.userId, this.selectedAssessmentYear)
            .subscribe((assessmentSummary) => {
              // Now assessmentSummary can be processed after loadData is complete
              this.isDisabled = assessmentSummary?.status === 1;
              console.log('Updated isDisabled:', this.isDisabled);
            });
        },
        (error) => {
          console.error('Error loading suggestions:', error);
        }
      );
  }

  saveSuggestions(): void {
    const newRows = this.groupData[0].rows.filter((row: any) => !row.saved);
    const updatedRows = this.groupData[0].rows.filter((row: any) => row.saved);

    // Check for empty suggestions in new rows
    const hasEmptyNewRows = newRows.some((row: any) => !row.suggestion.trim());
    // Check for empty suggestions in updated rows
    const hasEmptyUpdatedRows = updatedRows.some(
      (row: any) => !row.suggestion.trim()
    );

    if (hasEmptyNewRows || hasEmptyUpdatedRows) {
      Swal.fire(
        'Warning',
        'Please fill in all suggestion fields before submitting.',
        'warning'
      );
      return;
    }

    if (newRows.length === 0 && updatedRows.length === 0) {
      Swal.fire('Warning', 'No new row has been made or updated.', 'warning');
      return;
    }

    // Tampilkan dialog konfirmasi
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to save?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, I am sure',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload: EmpSuggestDto[] = newRows.map((row: any) => ({
          user_id: this.userId as UUID,
          suggestion: row.suggestion,
          assessment_year: this.assessmentYear,
        }));

        this.empSuggestService.saveEmpSuggest(payload).subscribe(
          (response) => {
            console.log('New data saved successfully:', response);
            newRows.forEach((row: any) => (row.saved = true));
            Swal.fire(
              'Success',
              'New data has been submitted successfully!',
              'success'
            );
          },
          (error) => {
            console.error('Error saving new data:', error);
            Swal.fire('Error', 'Failed to submit new data.', 'error');
          }
        );

        const updatePayload = updatedRows.map((row: any) => ({
          id: row.id,
          user_id: this.userId as UUID,
          suggestion: row.suggestion,
          assessment_year: this.assessmentYear,
        }));

        if (updatePayload.length > 0) {
          this.empSuggestService.updateEmpSuggest(updatePayload).subscribe(
            (response) => {
              console.log('Updated data successfully:', response);
              Swal.fire(
                'Success',
                'Updated data has been submitted successfully!',
                'success'
              );
            },
            (error) => {
              console.error('Error updating data:', error);
              Swal.fire('Error', 'Failed to update data.', 'error');
            }
          );
        }
      }
    });
  }

  deleteSuggestion(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the suggestion!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.empSuggestService.deleteEmpSuggest(id).subscribe(
          (response) => {
            console.log('Suggestion deleted successfully:', response);
            this.loadSavedSuggestions(); // Reload suggestions after deletion
            Swal.fire(
              'Deleted!',
              'Your suggestion has been deleted.',
              'success'
            );
          },
          (error) => {
            console.error('Error deleting suggestion:', error);
            Swal.fire('Error', 'Failed to delete suggestion.', 'error');
          }
        );
      }
    });
  }

  addRow(group: any): void {
    if (group.rows.length >= 10) {
      Swal.fire('Warning', 'Maximun only 10 rows are allowed.', 'warning');
      return;
    }

    const newRow = {
      suggestion: '',
      saved: false,
      id: '',
    };
    group.rows.push(newRow);
  }

  deleteRow(group: any, rowIndex: number): void {
    group.rows.splice(rowIndex, 1);
  }
}
