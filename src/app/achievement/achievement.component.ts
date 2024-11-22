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
  ],
})
export class AchievementComponent implements OnInit {
  achievements: AchieveWithGroupNameDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  // Use a single object to hold new achievement form data
  newAchievement = {
    achievement_name: '',
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

  // Function to handle creating a new achievement
  createAchievement(): void {
    if (
      this.newAchievement.achievement_name &&
      this.newAchievement.group_achievement_name
    ) {
      const achievementData = {
        achievement_name: this.newAchievement.achievement_name,
        group_achievement_name: this.newAchievement.group_achievement_name, // Use group_achievement_name here
        enabled: this.newAchievement.enabled,
      };

      // Use the service to create a new achievement
      this.achieveService.createAchievement(achievementData).subscribe({
        next: (response) => {
          console.log('Achievement created successfully:', response);
          this.fetchAchievements(); // Refresh the data table
          this.newAchievement = {
            achievement_name: '',
            group_achievement_name: '', // Reset correctly
            enabled: 1,
          };
        },
        error: (err) => {
          console.error('Error creating achievement:', err);
        },
      });
    } else {
      console.warn('Please fill in all fields.');
    }
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
}
