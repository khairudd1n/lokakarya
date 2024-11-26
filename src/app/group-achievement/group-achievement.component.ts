import { Component, OnInit } from '@angular/core';
import {
  GroupAchieveDto,
  GroupAchievementsService,
} from '../group-achievements.service';
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
        },
        error: (err) => {
          console.error('Error creating group achievement:', err);
          this.error = 'Failed to create group achievement';
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
        },
        error: (err) => {
          console.error('Error updating group attitude skill:', err);
        },
      });
  }

  // Delete a group attitude skill
  deleteGroupAchievement(id: UUID): void {
    if (confirm('Are you sure you want to delete this group achievement?')) {
      this.groupAchieveService.deleteGroupAchievement(id).subscribe({
        next: () => {
          this.groupAchievements = this.groupAchievements.filter(
            (skill) => skill.id !== id
          );
          console.log(`Deleted Group Achievement with ID: ${id}`);
        },
        error: (err) => {
          console.error('Error deleting group achievement:', err);
          this.error = 'Failed to delete group achievement';
        },
      });
    }
  }
}
