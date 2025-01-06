import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AchieveWithGroupNameDto,
  AchievementService,
} from '../../core/services/achievement.service';
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
import { NavBarComponent } from '../nav-bar/nav-bar/nav-bar.component';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.css'],
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
    ToggleButtonModule,
  ],
})
export class AchievementComponent implements OnInit {
  achievements: AchieveWithGroupNameDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  newAchievement = {
    achievement_name: '',
    group_achievement_id: '',
    enabled: 1,
  };
  displayEditDialog: boolean = false;
  editAchievement: AchieveWithGroupNameDto = {
    id: '' as UUID,
    achievement_name: '',
    group_achievement_id: '' as UUID,
    group_achievement_name: '',
    enabled: 1,
  };
  currentGroup: string = '';
  groupIndex: number = 0;

  groupAchievementOptions: { label: string; value: string }[] = [];

  constructor(private achieveService: AchievementService) {}

  ngOnInit(): void {
    this.fetchAchievements();
    this.fetchGroupAchievementOptions();
  }

  resetGroupIndex(achievement: any): number {
    if (this.currentGroup !== achievement.group_achievement_name) {
      this.currentGroup = achievement.group_achievement_name;
      this.groupIndex = 1;
    } else {
      this.groupIndex++;
    }
    return this.groupIndex;
  }

  @ViewChild('dt2') dt2: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt2) {
      this.dt2.filterGlobal(input, 'contains');
    }
  }

  fetchAchievements(): void {
    this.achieveService.getAllAchievementsWithGroupNames().subscribe({
      next: (data) => {
        this.achievements = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching achievements:', err);
        this.error = 'Failed to fetch achievements';
        this.isLoading = false;
      },
    });
  }

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  showEditDialog(achievement: AchieveWithGroupNameDto): void {
    this.editAchievement = { ...achievement };
    this.displayEditDialog = true;
  }

  createAchievement(): void {
    if (
      this.newAchievement.achievement_name &&
      this.newAchievement.group_achievement_id
    ) {
      const achievementData = {
        achievement_name: this.newAchievement.achievement_name,
        group_achievement_id: this.newAchievement.group_achievement_id as UUID,
        enabled: this.newAchievement.enabled,
      };

      console.log('Sending payload for achievement creation:', achievementData);

      this.achieveService.createAchievement(achievementData).subscribe({
        next: (response) => {
          console.log('Achievement created successfully:', response);
          this.fetchAchievements();
          this.displayCreateDialog = false;
          this.newAchievement = {
            achievement_name: '',
            group_achievement_id: '',
            enabled: 1,
          };

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Achievement created successfully!',
          });
        },
        error: (err) => {
          console.error('Error creating achievement:', err);

          if (err.error && err.error.message) {
            console.error('Backend error message:', err.error.message);
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create Achievement. Please try again.',
          });
        },
      });
    } else {
      console.warn('Please fill in all fields.');
    }
  }

  updateAchievement(): void {
    const updatedData = {
      achievement_name: this.editAchievement.achievement_name,
      group_achievement_id: this.editAchievement.group_achievement_id as UUID,
      enabled: this.editAchievement.enabled,
    };

    this.achieveService
      .updateAchievement(this.editAchievement.id, updatedData)
      .subscribe({
        next: (response) => {
          console.log('Achievement updated successfully:', response);
          this.fetchAchievements();
          this.displayEditDialog = false;

          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Achievement updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating achievement:', err);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while updating the achievement.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }

  fetchGroupAchievementOptions(): void {
    this.achieveService.getGroupAchievements().subscribe({
      next: (data) => {
        this.groupAchievementOptions = data;
      },
      error: (err) => {
        console.error('Error fetching group achievement options:', err);
      },
    });
  }

  onGroupAchievementChange(event: any): void {
    console.log(
      'Selected group_achievement_id:',
      this.newAchievement.group_achievement_id
    );
    console.log(
      'Selected group_achievement_id:',
      this.editAchievement.group_achievement_id
    );
  }

  deleteAchievement(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Achievement? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.achieveService.deleteAchievement(id).subscribe({
          next: () => {
            this.fetchAchievements();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Achievement has been deleted successfully.',
            });
          },
          error: (err) => {
            console.error('Error deleting achievement:', err);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete the Achievement. Please try again.',
            });
          },
        });
      }
    });
  }
}
