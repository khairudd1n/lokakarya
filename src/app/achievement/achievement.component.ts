import { Component, OnInit } from '@angular/core';
import {
  AchieveWithGroupNameDto,
  AchievementService,
} from '../achievement.service';
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

  groupAchievementOptions: { label: string; value: string }[] = []; // Populate with your actual options

  constructor(private achieveService: AchievementService) {}

  ngOnInit(): void {
    this.fetchAchievements();
    this.fetchGroupAchievementOptions(); // Fetch options from the service
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

  // Show the create dialog
  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  showEditDialog(achievement: AchieveWithGroupNameDto): void {
    // Populate the editAchievement object with selected achievement data
    this.editAchievement = { ...achievement };
    this.displayEditDialog = true;
  }

  // Function to handle creating a new achievement
  createAchievement(): void {
    if (
      this.newAchievement.achievement_name &&
      this.newAchievement.group_achievement_id // Use the correct property name here
    ) {
      const achievementData = {
        achievement_name: this.newAchievement.achievement_name,
        group_achievement_id: this.newAchievement.group_achievement_id as UUID, // Ensure it's a valid UUID
        enabled: this.newAchievement.enabled,
      };

      // Log the payload to make sure it's correct
      console.log('Sending payload for achievement creation:', achievementData);

      // Use the service to create a new achievement
      this.achieveService.createAchievement(achievementData).subscribe({
        next: (response) => {
          console.log('Achievement created successfully:', response);
          this.fetchAchievements(); // Refresh the data table
          this.newAchievement = {
            achievement_name: '',
            group_achievement_id: '', // Reset correctly
            enabled: 1,
          };
        },
        error: (err) => {
          console.error('Error creating achievement:', err);
          // Log the backend's response if available
          if (err.error && err.error.message) {
            console.error('Backend error message:', err.error.message);
          }
        },
      });
    } else {
      console.warn('Please fill in all fields.');
    }
  }

  // updateAchievement(): void {
  //   if (
  //     this.editAchievement.achievement_name &&
  //     this.editAchievement.group_achievement_id
  //   ) {
  //     this.achieveService
  //       .updateAchievement(this.editAchievement.id, this.editAchievement)
  //       .subscribe({
  //         next: (response) => {
  //           console.log('Achievement updated successfully:', response);
  //           this.fetchAchievements(); // Refresh the data table
  //           this.displayEditDialog = false; // Close the edit dialog
  //         },
  //         error: (err) => {
  //           console.error('Error updating achievement:', err);
  //         },
  //       });
  //   } else {
  //     console.warn('Please fill in all fields.');
  //   }
  // }

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
          this.fetchAchievements(); // Refresh the data table
          this.displayEditDialog = false; // Close the dialog
        },
        error: (err) => {
          console.error('Error updating achievement:', err);
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }

  fetchGroupAchievementOptions(): void {
    this.achieveService.getGroupAchievements().subscribe({
      next: (data) => {
        // Now the data is in the correct format for the dropdown
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
}
