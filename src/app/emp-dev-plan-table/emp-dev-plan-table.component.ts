import { Component, OnInit } from '@angular/core';
import {
  EmpDevPlanService,
  EmpDevPlanCreateDto,
} from '../emp-dev-plan.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-emp-dev-plan-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    FormsModule,
    DialogModule,
  ],
  templateUrl: './emp-dev-plan-table.component.html',
  styleUrl: './emp-dev-plan-table.component.css',
})
export class EmpDevPlanTableComponent implements OnInit {
  empDevPlans: EmpDevPlanCreateDto[] = [];
  userId: string = '';
  assessmentYear: number = new Date().getFullYear();
  groupData: any[] = [];

  constructor(private empDevPlanService: EmpDevPlanService) {}
  ngOnInit(): void {
    this.getUserIdFromToken();
    this.fetchEmpDevPlans();
  }

  getUserIdFromToken(): void {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1])); // Decode JWT payload
        console.log('Full Token Payload:', payload);
        this.userId = payload.sub || ''; // Extract userId from payload
        console.log('Logged-in User ID:', this.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found in localStorage.');
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

  deleteEmpDevPlan(planId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.empDevPlanService.deleteEmpDevPlan(planId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The plan has been deleted.', 'success');
            this.fetchEmpDevPlans(); // Refresh data
          },
          error: (err) => {
            console.error('Error deleting plan:', err);
            Swal.fire(
              'Error!',
              'Failed to delete the plan. Please try again.',
              'error'
            );
          },
        });
      }
    });
  }
}
