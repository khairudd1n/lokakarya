import { Component, OnInit } from '@angular/core';
import {
  GroupAchieveDto,
  GroupAchievementsService,
} from '../group-achievements.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-group-achievement',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf],
  templateUrl: './group-achievement.component.html',
  styleUrl: './group-achievement.component.css',
})
export class GroupAchievementComponent implements OnInit {
  groupAchievements: GroupAchieveDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;

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
}
