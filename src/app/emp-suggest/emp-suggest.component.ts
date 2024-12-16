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
  ],
  templateUrl: './emp-suggest.component.html',
  styleUrls: ['./emp-suggest.component.css'],
})
export class EmpSuggestComponent implements OnInit {
  groupData: any[] = [];
  userId: string = '';
  assessmentYear: number = new Date().getFullYear();

  assessmentYears: number[] = []; // Array untuk menampung tahun
  selectedAssessmentYear: number = new Date().getFullYear(); // Tahun yang dipilih

  isPreviousYearSelected: boolean = false;

  constructor(private empSuggestService: EmpSuggestService) {}

  ngOnInit(): void {
    this.getUserId();
    this.initializeGroupData();
    this.loadSavedSuggestions();
    this.initializeAssessmentYears(); // Panggil fungsi untuk menginisialisasi tahun
  }

  initializeAssessmentYears(): void {
    this.empSuggestService.getAssessmentYears().subscribe(
      (years) => {
        this.assessmentYears = years; // Isi dropdown dengan tahun yang diterima
        if (!this.assessmentYears.includes(this.selectedAssessmentYear)) {
          this.selectedAssessmentYear = this.assessmentYears[0]; // Default ke tahun pertama jika tidak ada kecocokan
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
    this.groupData = [{ rows: [{ suggestion: '' }] }];
  }

  loadSavedSuggestions(): void {
    this.empSuggestService
      .getEmpSuggestByUserIdAndYear(this.userId, this.selectedAssessmentYear)
      .subscribe(
        (data) => {
          this.groupData[0].rows = data.map((item) => ({
            suggestion: item.suggestion,
            saved: true, // Tandai sebagai data tersimpan
          }));
        },
        (error) => {
          console.error('Error loading suggestions:', error);
        }
      );
  }

  saveSuggestions(): void {
    // Cek jika ada baris baru yang belum diisi
    const hasEmptyNewRows = this.groupData[0].rows.some(
      (row: any) => !row.saved && row.suggestion.trim() === ''
    );

    if (hasEmptyNewRows) {
      Swal.fire('Warning', 'Input tanggapan terlebih dahulu.', 'warning');
      return;
    }

    const newRows = this.groupData[0].rows.filter((row: any) => !row.saved);

    if (newRows.length === 0) {
      Swal.fire('Warning', 'Tidak ada data baru untuk disimpan.', 'warning');
      return;
    }

    // Tampilkan dialog konfirmasi
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah Anda yakin ingin menyimpan data ini? Data yang sudah tersimpan tidak dapat diubah lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika pengguna mengonfirmasi, lanjutkan dengan penyimpanan
        const payload: EmpSuggestDto[] = newRows.map((row: any) => ({
          user_id: this.userId as UUID,
          suggestion: row.suggestion,
          assessment_year: this.assessmentYear,
        }));

        this.empSuggestService.saveEmpSuggest(payload).subscribe(
          (response) => {
            console.log('Data saved successfully:', response);

            // Tandai data yang baru disimpan sebagai tersimpan
            newRows.forEach((row: any) => (row.saved = true));

            Swal.fire('Success', 'Tanggapan berhasil disimpan!', 'success');
          },
          (error) => {
            console.error('Error saving data:', error);
            Swal.fire('Error', 'Gagal menyimpan tanggapan.', 'error');
          }
        );
      }
    });
  }

  addRow(group: any): void {
    if (group.rows.length >= 10) {
      Swal.fire('Warning', 'Maksimum 10 baris saja yang diizinkan.', 'warning');
      return;
    }

    const newRow = {
      suggestion: '',
      saved: false,
    };
    group.rows.push(newRow);
  }

  deleteRow(group: any, rowIndex: number): void {
    group.rows.splice(rowIndex, 1);
  }
}
