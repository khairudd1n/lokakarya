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
  keterangan: string;
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

  constructor(
    private http: HttpClient,
    private empDevPlanService: EmpDevPlanService
  ) {}

  // ngOnInit(): void {
  //   this.getUserId();
  //   this.getAllEmpDevPlan().subscribe((data) => {
  //     this.groupData = data.map((group) => ({
  //       ...group,
  //       rows: group.rows || [{ keterangan: '' }], // Initialize rows if not present
  //     }));
  //     console.log('Fetched Dev Plan:', this.groupData);
  //   });
  // }

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
        })) || [{ keterangan: '', plan_detail: '', dev_plan_id: group.id }], // Ensure dev_plan_id is included if rows are empty
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
    group.rows.push({ keterangan: '' });
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

  // logPlanId(dev_plan_id: string, plan_detail: string): void {
  //   console.log('Received devPlanId:', dev_plan_id);

  //   const existingPlanIndex = this.selectedPlans.findIndex(
  //     (plan) => plan.dev_plan_id === dev_plan_id
  //   );

  //   if (existingPlanIndex !== -1) {
  //     // Update the existing skill if it already exists
  //     this.selectedPlans[existingPlanIndex].plan_detail = plan_detail;
  //   } else {
  //     // Create a new skill object if it doesn't exist
  //     const plan: EmpDevPlanCreateDto = {
  //       user_id: this.userId as UUID,
  //       dev_plan_id: dev_plan_id as UUID,
  //       plan_detail,
  //       assessment_year: this.assessmentYear,
  //     };
  //     console.log('Group Data:', this.groupData);
  //     console.log('Adding Plan to Selection:', plan);
  //     this.selectedPlans.push(plan);
  //   }
  // }

  logPlanId(devPlanId: string, plan_detail: string, row: any): void {
    // Use the dev_plan_id from the row itself
    const existingPlanIndex = this.selectedPlans.findIndex(
      (plan) => plan.dev_plan_id === row.dev_plan_id // Match using row.dev_plan_id
    );

    if (existingPlanIndex !== -1) {
      // Update the existing plan if it already exists
      this.selectedPlans[existingPlanIndex].plan_detail = plan_detail;
    } else {
      // Create a new plan object if it doesn't exist
      const plan: EmpDevPlanCreateDto = {
        user_id: this.userId as UUID,
        dev_plan_id: row.dev_plan_id as UUID, // Use dev_plan_id from the row
        plan_detail,
        assessment_year: this.assessmentYear,
      };
      console.log('Adding Plan to Selection:', plan);
      this.selectedPlans.push(plan);
    }
  }

  savePlans(): void {
    if (this.selectedPlans.length > 0) {
      console.log('Final data to be saved:', this.selectedPlans);
      this.empDevPlanService.saveEmpDevPlan(this.selectedPlans).subscribe(
        (response) => {
          console.log('Save successful:', response);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Plans saved successfully!',
          }).then(() => {});
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
}
