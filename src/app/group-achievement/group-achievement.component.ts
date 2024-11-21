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
  ],
  templateUrl: './group-achievement.component.html',
  styleUrl: './group-achievement.component.css',
})
export class GroupAchievementComponent implements OnInit {
  groupAchievements: GroupAchieveDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false; // State for the create dialog
  newGroupAchievement: Partial<GroupAchieveDto> = {
    group_achievement_name: '',
    percentage: 0,
  }; // Model for the new group achievement

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
        next: (newAchievement) => {
          this.groupAchievements.push(newAchievement);
          this.displayCreateDialog = false;
          this.newGroupAchievement = {
            group_achievement_name: '',
            percentage: 0,
          };
        },
        error: (err) => {
          console.error('Error creating group achievement:', err);
          this.error = 'Failed to create group achievement';
        },
      });
  }
}
