import { Component, OnInit } from '@angular/core';
import {
  GroupAchieveDto,
  GroupAchievementsService,
} from '../../core/services/group-achievements.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog'; // Add import for DialogModule
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { NavBarComponent } from '../nav-bar/nav-bar/nav-bar.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-group-achievement',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgIf,
    HttpClientModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    NavBarComponent,
    ToggleButtonModule,
    TagModule,
  ],
  templateUrl: './group-achievement.component.html',
  styleUrl: './group-achievement.component.css',
})
export class GroupAchievementComponent implements OnInit {
  groupAchievements: GroupAchieveDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false; // State for the create dialog
  displayEditDialog: boolean = false;
  newGroupAchievement: Partial<GroupAchieveDto> = {
    group_achievement_name: '',
    percentage: 0,
    enabled: 1,
  }; // Model for the new group achievement
  isDuplicate: boolean = false;
  selectedGroupAchievement: Partial<GroupAchieveDto> = {};

  constructor(private groupAchieveService: GroupAchievementsService) {}

  ngOnInit(): void {
    this.fetchGroupAchievements();
  }

  fetchGroupAchievements(): void {
    this.groupAchieveService.getAllGroupAchievements().subscribe({
      next: (data) => {
        this.groupAchievements = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching group achievements:', err);
        this.error = 'Failed to fetch group achievements';
        this.isLoading = false;
      },
    });
  }

  // Show the create dialog
  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  // Create a new group achievement
  createGroupAchievement(): void {
    if (
      !this.newGroupAchievement.group_achievement_name ||
      this.newGroupAchievement.percentage === undefined
    ) {
      return;
    }

    // Cek apakah data sudah ada di database
    const existingGroupAchieve = this.groupAchievements.find(
      (division) =>
        division.group_achievement_name.toLowerCase() ===
        this.newGroupAchievement.group_achievement_name?.toLowerCase()
    );
    if (existingGroupAchieve) {
      this.isDuplicate = true;
      return;
    }

    this.groupAchieveService
      .createGroupAchievement(this.newGroupAchievement)
      .subscribe({
        next: (newGroupAchievement) => {
          this.groupAchievements.push(newGroupAchievement);
          this.displayCreateDialog = false;
          this.newGroupAchievement = {
            group_achievement_name: '',
            percentage: 0,
            enabled: 1,
          };

          // Success notification
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Group Achievement created successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error creating group achievement:', err);
          this.error = 'Failed to create group achievement';

          // Error notification
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while creating the group achievement.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  // Show the edit dialog
  editGroupAchievement(groupAchievement: GroupAchieveDto): void {
    this.selectedGroupAchievement = { ...groupAchievement };
    this.displayEditDialog = true;
  }

  // Update an existing group attitude skill
  updateGroupAchievement(): void {
    if (
      !this.selectedGroupAchievement.id ||
      !this.selectedGroupAchievement.group_achievement_name ||
      this.selectedGroupAchievement.percentage === undefined
    ) {
      return;
    }

    this.groupAchieveService
      .updateGroupAchievement(
        this.selectedGroupAchievement.id,
        this.selectedGroupAchievement
      )
      .subscribe({
        next: (updatedGroupAchievement) => {
          const index = this.groupAchievements.findIndex(
            (item) => item.id === updatedGroupAchievement.id
          );
          if (index !== -1) {
            this.groupAchievements[index] = updatedGroupAchievement;
          }
          this.displayEditDialog = false;
          // Success notification
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Group Achievement updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating group attitude skill:', err);
          // Error notification
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while updating the group achievement.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  // Delete a group attitude skill
  deleteGroupAchievement(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this group achievement?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.groupAchieveService.deleteGroupAchievement(id).subscribe({
          next: () => {
            // Remove the deleted group achievement from the list
            this.groupAchievements = this.groupAchievements.filter(
              (achievement) => achievement.id !== id
            );

            // Success notification
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The group achievement has been deleted.',
              confirmButtonText: 'OK',
            });
            console.log(`Deleted Group Achievement with ID: ${id}`);
          },
          error: (err) => {
            // Error notification
            console.error('Error deleting group achievement:', err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong while deleting the group achievement.',
              confirmButtonText: 'Try Again',
            });
          },
        });
      }
    });
  }
}
