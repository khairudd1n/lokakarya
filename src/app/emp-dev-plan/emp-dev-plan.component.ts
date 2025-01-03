import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table'; // For table
import { InputNumberModule } from 'primeng/inputnumber'; // For number input
import { ButtonModule } from 'primeng/button';
import {
  EmpDevPlanService,
  EmpDevPlanCreateDto,
} from '../emp-dev-plan.service';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';
import { forkJoin } from 'rxjs';

interface Row {
  plan: string;
  plan_detail: string;
  dev_plan_id?: string; // Mark as optional if it might not be present initially
  status: string;
  [key: string]: any; // Allows additional properties if needed
}

interface Group {
  id: string;
  rows: Row[];
  [key: string]: any; // Allows additional properties
}

@Component({
  selector: 'app-emp-dev-plan',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    FormsModule,
    NavBarComponent,
  ],
  templateUrl: './emp-dev-plan.component.html',
  styleUrls: ['./emp-dev-plan.component.css'], // Corrected to 'styleUrls'
})
export class EmpDevPlanComponent implements OnInit {
  empDevPlans: EmpDevPlanCreateDto[] = [];
  groupData: any[] = [];
  userId: string = ''; // For storing the logged-in userId
  selectedPlans: EmpDevPlanCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();

  assessmentYears: number[] = []; // Array untuk menampung tahun
  selectedAssessmentYear: number = new Date().getFullYear(); // Tahun yang dipilih

  isPreviousYearSelected: boolean = false;

  constructor(
    private http: HttpClient,
    private empDevPlanService: EmpDevPlanService
  ) {}

  ngOnInit(): void {
    this.getUserId();
    this.fetchData(); // Call the new method to fetch data
    this.initializeAssessmentYears(); // Panggil fungsi untuk menginisialisasi tahun
  }

  // initializeAssessmentYears(): void {
  //   this.empDevPlanService.getAssessmentYears().subscribe(
  //     (years) => {
  //       this.assessmentYears = years; // Isi dropdown dengan tahun yang diterima
  //       if (!this.assessmentYears.includes(this.selectedAssessmentYear)) {
  //         this.selectedAssessmentYear = this.assessmentYears[0]; // Default ke tahun pertama jika tidak ada kecocokan
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching assessment years:', error);
  //     }
  //   );
  // }

  initializeAssessmentYears(): void {
    this.empDevPlanService.getAssessmentYears().subscribe(
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
    this.fetchData(); // Panggil ulang data ketika tahun berubah
  }

  fetchData(): void {
    if (!this.userId) {
      console.error('User  ID is missing. Cannot fetch data.');
      return;
    }

    const empDevPlans$ = this.empDevPlanService.getEmpDevPlanByUserIdAndYear(
      this.userId,
      this.selectedAssessmentYear
    );
    const allDevPlans$ = this.empDevPlanService.getAllDevPlan();

    forkJoin([empDevPlans$, allDevPlans$]).subscribe({
      next: ([empDevPlans, allDevPlans]) => {
        this.empDevPlans = empDevPlans;

        // Initialize groupData with allDevPlans
        this.groupData = allDevPlans.map((group) => ({
          ...group,
          rows:
            group.rows?.map((row: Row) => ({
              ...row,
              plan_detail:
                row['user_id'] === this.userId &&
                row['assessment_year'] === this.selectedAssessmentYear
                  ? row.plan_detail
                  : '', // Check plan_detail based on user_id
            })) || [], // Ensure rows is an empty array if no rows exist
        }));

        // Structure empDevPlans into groups
        const empDevPlanGroups = this.organizeDataIntoGroups(empDevPlans);

        // Merge empDevPlanGroups into groupData
        empDevPlanGroups.forEach((empGroup) => {
          const existingGroup = this.groupData.find(
            (group) => group.plan === empGroup.plan
          );
          if (existingGroup) {
            existingGroup.rows = empGroup.rows; // Update existing group with user-specific plans
          } else {
            this.groupData.push(empGroup); // Add new group if it doesn't exist
          }
        });

        console.log('Fetched EmpDevPlans:', this.empDevPlans);
        console.log('Fetched All Dev Plans:', this.groupData);
      },
      error: (err) => {
        console.error('Error fetching data', err);
      },
    });
  }

  addRow(group: any): void {
    const newRow = {
      plan: group.plan,
      plan_detail: '',
      dev_plan_id: group.id,
      status: 'unsaved',
    }; // Mark new rows as unsaved
    console.log('Adding new row:', newRow);
    group.rows.push(newRow);
  }

  // Function to delete a row
  deleteRow(group: any, rowIndex: number): void {
    group.rows.splice(rowIndex, 1);
  }

  getUserId(): void {
    const userToken = localStorage.getItem('token');

    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1])); // Decode JWT payload
        console.log('Full Token Payload:', payload);

        // Extract userId from the 'sub' key
        this.userId = payload.sub;
        console.log('Logged-in User ID:', this.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found in localStorage.');
    }
  }

  logPlanId(devPlanId: string, plan_detail: string, row: any): void {
    // Hanya tambahkan ke selectedPlans jika plan_detail tidak kosong
    if (plan_detail.trim() !== '') {
      // Buat objek plan baru
      const plan: EmpDevPlanCreateDto = {
        user_id: this.userId as UUID,
        plan: row.plan,
        dev_plan_id: row.dev_plan_id as UUID,
        plan_detail,
        assessment_year: this.assessmentYear,
        status: 'saved',
        created_at: new Date(),
      };

      // Cek apakah plan sudah ada di selectedPlans
      const existingPlanIndex = this.selectedPlans.findIndex(
        (plan) =>
          plan.dev_plan_id === row.dev_plan_id &&
          plan.plan_detail === plan_detail
      );

      if (existingPlanIndex !== -1) {
        this.selectedPlans[existingPlanIndex] = plan; // Update existing plan
        console.log('Updated plan in Selection:', plan);
      } else {
        console.log('Add plan added to Selection:', plan);
        this.selectedPlans.push(plan); // Add new plan
      }
    }
  }

  savePlans(): void {
    // Reset selectedPlans setiap kali simpan dipanggil
    this.selectedPlans = [];

    // Loop melalui semua grup dan baris untuk mengumpulkan rencana yang akan disimpan
    this.groupData.forEach((group: Group) => {
      group.rows.forEach((row: Row) => {
        // Menambahkan tipe Row di sini
        if (row.plan_detail.trim() !== '' && row.status !== 'saved') {
          // Cek status
          const plan: EmpDevPlanCreateDto = {
            user_id: this.userId as UUID,
            plan: row.plan,
            dev_plan_id: row.dev_plan_id as UUID,
            plan_detail: row.plan_detail,
            assessment_year: this.assessmentYear,
            status: 'saved',
            created_at: new Date(),
          };
          this.selectedPlans.push(plan);
        }
      });
    });

    if (this.selectedPlans.length > 0) {
      Swal.fire({
        title: 'Are you sure you want to submit?',
        text: 'Data that has been submitted cannot be change anymore.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, I am sure',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Final data to be saved:', this.selectedPlans);

          // Kirim data ke backend melalui service
          this.empDevPlanService.saveEmpDevPlan(this.selectedPlans).subscribe(
            (response) => {
              console.log('Save successful:', response);

              // Perbarui status di frontend
              this.selectedPlans.forEach((plan) => {
                const group = this.groupData.find(
                  (grp) => grp.id === plan.dev_plan_id
                );
                if (group) {
                  const row = group.rows.find(
                    (r: Row) => r.plan_detail === plan.plan_detail
                  );
                  if (row) {
                    row.status = 'saved'; // Tandai sebagai "saved"
                  }
                }
              });

              // Reset selectedPlans setelah menyimpan
              this.selectedPlans = [];

              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Data has been submitted successfully!',
              });
            },
            (error) => {
              console.error('Save failed:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to save data.',
              });
            }
          );
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Fill in the description first.',
      });
    }
  }

  organizeDataIntoGroups(data: EmpDevPlanCreateDto[]): any[] {
    const groups: any[] = [];

    // Group data by plan (you can change the criterion if necessary)
    data.forEach((plan) => {
      const group = groups.find((g) => g.plan === plan.plan);
      if (group) {
        group.rows.push(plan); // Add rows to existing group
      } else {
        groups.push({ plan: plan.plan, rows: [plan] }); // Create new group
      }
    });
    return groups;
  }
}
