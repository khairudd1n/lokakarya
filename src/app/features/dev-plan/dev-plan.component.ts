import { Component, OnInit } from '@angular/core';
import {
  DevPlanDto,
  DevPlanService,
} from '../../core/services/dev-plan.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dev-plan',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    DropdownModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    MenubarModule,
  ],
  templateUrl: './dev-plan.component.html',
  styleUrl: './dev-plan.component.css',
})
export class DevPlanComponent implements OnInit {
  devPlans: DevPlanDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  newDevPlan: Partial<DevPlanDto> = {
    plan: '',
    enabled: 1,
  };
  selectedDevPlan: Partial<DevPlanDto> = {};

  constructor(private devPlanService: DevPlanService) {}

  ngOnInit(): void {
    this.fetchDevPlans();
  }

  fetchDevPlans(): void {
    this.devPlanService.getAllDevPlan().subscribe({
      next: (data) => {
        this.devPlans = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching dev plans:', err);
        this.error = 'Failed to fetch dev plans';
        this.isLoading = false;
      },
    });
  }

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  createDevPlan(): void {
    if (!this.newDevPlan.plan === undefined) {
      return;
    }

    this.devPlanService.createDevPlan(this.newDevPlan).subscribe({
      next: (newDevPlan) => {
        this.devPlans.push(newDevPlan);
        this.displayCreateDialog = false;
        this.newDevPlan = {
          plan: '',
          enabled: 1,
        };

        // Success notification
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Dev Plan created successfully.',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        console.error('Error creating dev plan:', err);

        // Error notification
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while creating the dev plan.',
          confirmButtonText: 'Try Again',
        });
      },
    });
  }

  editDevPlan(devPlan: DevPlanDto): void {
    this.selectedDevPlan = { ...devPlan };
    this.displayEditDialog = true;
  }

  updateDevPlan(): void {
    if (!this.selectedDevPlan.id || !this.selectedDevPlan.plan === undefined) {
      return;
    }

    this.devPlanService
      .updateDevPlan(this.selectedDevPlan.id, this.selectedDevPlan)
      .subscribe({
        next: (updatedDevPlan) => {
          const index = this.devPlans.findIndex(
            (item) => item.id === updatedDevPlan.id
          );
          if (index !== -1) {
            this.devPlans[index] = updatedDevPlan;
          }
          this.displayEditDialog = false;

          // Success notification
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Dev Plan updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating dev plan:', err);

          // Error notification
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while updating the dev plan.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  deleteDevPlan(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this dev plan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.devPlanService.deleteDevPlan(id).subscribe({
          next: () => {
            // Remove the deleted group attitude skill from the list
            this.devPlans = this.devPlans.filter((skill) => skill.id !== id);

            // Success notification
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The dev plan has been deleted.',
              confirmButtonText: 'OK',
            });
            console.log(`Deleted Dev Plan with ID: ${id}`);
          },
          error: (err) => {
            // Error notification
            console.error('Error deleting dev plan:', err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong while deleting the dev plan.',
              confirmButtonText: 'Try Again',
            });
          },
        });
      }
    });
  }
}
