import { Component, OnInit } from '@angular/core';
import { EmpAchieveSkillDto, EmpAchieveService } from '../emp-achieve.service';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';

@Component({
  selector: 'app-emp-achieve',
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
    NavBarComponent,
  ],
  templateUrl: './emp-achieve.component.html',
  styleUrl: './emp-achieve.component.css',
})
export class EmpAchieveComponent implements OnInit {
  empAchieveSkill: EmpAchieveSkillDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  newEmpAchieve = {
    user_id: '',
    notes: '',
    achievement_id: '',
    score: 0,
    assessment_year: 0,
  };
  displayEditDialog: boolean = false;
  editEmpAchieve: EmpAchieveSkillDto = {
    id: '' as UUID,
    user_id: '' as UUID,
    username: '',
    notes: '',
    achievement_id: '' as UUID,
    achievement_name: '',
    score: 0,
    assessment_year: 0,
  };

  userOptions: { label: string; value: string }[] = [];
  achievementOptions: { label: string; value: string }[] = [];

  constructor(private empAchieveService: EmpAchieveService) {}

  ngOnInit(): void {
    this.fetchEmpAchieve();
    this.fetchUserOptions();
    this.fetchAchievementOptions();
  }

  fetchEmpAchieve(): void {
    this.empAchieveService.getAllEmpAchieve().subscribe({
      next: (data) => {
        this.empAchieveSkill = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching emp achieve:', err);
        this.error = 'Failed to fetch emp achieve';
        this.isLoading = false;
      },
    });
  }

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  showEditDialog(empAchieve: EmpAchieveSkillDto): void {
    // Populate the editAchievement object with selected achievement data
    this.editEmpAchieve = { ...empAchieve };
    this.displayEditDialog = true;
  }

  createEmpAchieve(): void {
    if (
      this.newEmpAchieve.user_id &&
      this.newEmpAchieve.notes &&
      this.newEmpAchieve.achievement_id &&
      this.newEmpAchieve.score &&
      this.newEmpAchieve.assessment_year
    ) {
      const empAchieveData = {
        user_id: this.newEmpAchieve.user_id as UUID,
        notes: this.newEmpAchieve.notes,
        achievement_id: this.newEmpAchieve.achievement_id as UUID,
        score: this.newEmpAchieve.score,
        assessment_year: this.newEmpAchieve.assessment_year,
      };

      // Log the payload to make sure it's correct
      console.log('Sending payload for emp achieve creation:', empAchieveData);

      // Use the service to create a new achievement
      this.empAchieveService.createEmpAchieve(empAchieveData).subscribe({
        next: (response) => {
          console.log('Emp achieve created successfully:', response);
          this.fetchEmpAchieve(); // Refresh the data table
          this.displayCreateDialog = false;
          this.newEmpAchieve = {
            user_id: '',
            notes: '',
            achievement_id: '',
            score: 0,
            assessment_year: 0,
          };
          // Show success alert using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Emp achieve created successfully!',
          });
        },
        error: (err) => {
          console.error('Error creating emp achieve:', err);
          // Log the backend's response if available
          if (err.error && err.error.message) {
            console.error('Backend error message:', err.error.message);
          }
          // Show error alert using SweetAlert
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create Emp achieve. Please try again.',
          });
        },
      });
    } else {
      console.warn('Please fill in all fields.');
    }
  }

  updateEmpAchieve(): void {
    const updatedData = {
      user_id: this.editEmpAchieve.user_id,
      notes: this.editEmpAchieve.notes,
      achievement_id: this.editEmpAchieve.achievement_id,
      score: this.editEmpAchieve.score,
      assessment_year: this.editEmpAchieve.assessment_year,
    };

    this.empAchieveService
      .updateEmpAchieve(this.editEmpAchieve.id, updatedData)
      .subscribe({
        next: (response) => {
          console.log('Emp Achieve updated successfully:', response);
          this.fetchEmpAchieve(); // Refresh the data table
          this.displayEditDialog = false; // Close the dialog
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Emp Achieve updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating Emp Achieve:', err);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update Emp Achieve. Please try again.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }

  fetchUserOptions(): void {
    this.empAchieveService.getUsers().subscribe({
      next: (data) => {
        this.userOptions = data; // Populate user dropdown
        console.log('User options:', this.userOptions);
      },
      error: (err) => {
        console.error('Error fetching user options:', err);
      },
    });
  }

  fetchAchievementOptions(): void {
    this.empAchieveService.getAchievements().subscribe({
      next: (data) => {
        // Now the data is in the correct format for the dropdown
        this.achievementOptions = data;
      },
      error: (err) => {
        console.error('Error fetching achievement options:', err);
      },
    });
  }

  onUserChange(event: any): void {
    console.log('Selected user_id:', this.newEmpAchieve.user_id);
    console.log('Selected user_id:', this.editEmpAchieve.user_id);
  }

  onAchievementChange(event: any): void {
    console.log('Selected achievement_id:', this.newEmpAchieve.achievement_id);
    console.log('Selected achievement_id:', this.editEmpAchieve.achievement_id);
  }

  deleteEmpAchieve(id: UUID): void {
    // Use SweetAlert to ask for confirmation before deleting
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Emp Achieve? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion if user confirms
        this.empAchieveService.deleteEmpAchieve(id).subscribe({
          next: () => {
            this.fetchEmpAchieve(); // Refresh the data table

            // Show success alert using SweetAlert
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Emp Achieve has been deleted successfully.',
            });
          },
          error: (err) => {
            console.error('Error deleting emp achieve:', err);

            // Show error alert using SweetAlert
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete the Emp Achieve. Please try again.',
            });
          },
        });
      }
    });
  }
}
