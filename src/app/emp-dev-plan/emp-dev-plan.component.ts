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
  savedPlans: EmpDevPlanCreateDto[] = []; // Menampung data yang sudah disimpan

  constructor(
    private http: HttpClient,
    private empDevPlanService: EmpDevPlanService
  ) {}

  ngOnInit(): void {
    this.getUserId();
    this.fetchData(); // Call the new method to fetch data
  }

  fetchData(): void {
    if (!this.userId) {
      console.error('User  ID is missing. Cannot fetch data.');
      return;
    }

    const empDevPlans$ = this.empDevPlanService.getEmpDevPlanByUserId(
      this.userId
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
                row['user_id'] === this.userId ? row.plan_detail : '', // Check plan_detail based on user_id
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
          plan.plan_detail === plan_detail &&
          plan.plan === row.plan
      );

      if (existingPlanIndex === -1) {
        // Jika tidak ada, tambahkan ke selectedPlans
        console.log('Adding Plan to Selection:', plan);
        this.selectedPlans.push(plan);
      } else {
        // Jika ada, update plan_detail
        this.selectedPlans[existingPlanIndex].plan_detail = plan_detail;
      }
    }
  }

  savePlans(): void {
    if (this.selectedPlans.length > 0) {
      Swal.fire({
        title: 'Apakah anda yakin ingin menyimpan data?',
        text: 'Data yang sudah disimpan tidak dapat diubah lagi.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, simpan',
        cancelButtonText: 'Batal',
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
                text: 'Rencana Pengembangan anda berhasil disimpan',
              });
            },
            (error) => {
              console.error('Save failed:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to save plans.',
              });
            }
          );
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Input keterangan terlebih dahulu.',
      });
    }
  }

  fetchEmpDevPlans(): void {
    if (!this.userId) {
      console.error('User ID is missing. Cannot fetch data.');
      return;
    }

    this.empDevPlanService.getEmpDevPlanByUserId(this.userId).subscribe({
      next: (data) => {
        this.empDevPlans = data;
        console.log('EmpDevPlans fetched successfully:', data); // Log if data is fetched successfully

        // Structure data into groupData
        this.groupData = this.organizeDataIntoGroups(data);
      },
      error: (err) => {
        console.error('Error fetching EmpDevPlans', err);
      },
    });
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
