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

interface Row {
  plan: string;
  plan_detail: string;
  dev_plan_id?: string; // Mark as optional if it might not be present initially
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
  ],
  templateUrl: './emp-dev-plan.component.html',
  styleUrls: ['./emp-dev-plan.component.css'], // Corrected to 'styleUrls'
})
export class EmpDevPlanComponent implements OnInit {
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
    this.getAllEmpDevPlan().subscribe((data: Group[]) => {
      // Type the data as an array of Group
      this.groupData = data.map((group) => ({
        ...group,
        rows: group.rows?.map((row: Row) => ({
          // Explicitly type the row parameter
          ...row,
          dev_plan_id: group.id, // Add dev_plan_id to each row
        })) || [{ plan_detail: '', dev_plan_id: group.id }], // Ensure dev_plan_id is included if rows are empty
      }));
      console.log('Fetched Dev Plan:', this.groupData);
    });
  }

  getAllEmpDevPlan(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<any[]>(`${this.apiUrl2}`, { headers })
      .pipe(tap((data) => console.log('Fetched Dev Plan:', data)));
  }

  // Function to add a new row
  addRow(group: any): void {
    const newRow = { plan: group.plan, plan_detail: '', dev_plan_id: group.id };
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
      console.log('Final data to be saved:', this.selectedPlans);
      this.empDevPlanService.saveEmpDevPlan(this.selectedPlans).subscribe(
        (response) => {
          console.log('Save successful:', response);

          // Tambahkan data ke tabel savedPlans
          this.savedPlans = [...this.savedPlans, ...this.selectedPlans];

          // Reset selectedPlans setelah berhasil menyimpan
          this.selectedPlans = [];

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Plans saved successfully!',
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
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Input keterangan terlebih dahulu.',
      });
    }
  }

  token: string = localStorage.getItem('token') || '';
  private apiUrl2 = 'http://localhost:8080/dev-plan';
  // private apiUrl2 = 'http://localhost:8080/emp-dev-plan';
}
