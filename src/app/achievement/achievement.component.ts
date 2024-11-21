import { Component, OnInit } from '@angular/core';
import { AchieveDto, AchievementService } from '../achievement.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog'; // Add import for DialogModule
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-achievement',
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
  templateUrl: './achievement.component.html',
  styleUrl: './achievement.component.css',
})
export class AchievementComponent implements OnInit {
  achievements: AchieveDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private achieveService: AchievementService) {}

  ngOnInit(): void {
    this.fetchAchievements();
  }

  fetchAchievements(): void {
    this.achieveService.getAllAchievements().subscribe({
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
}
