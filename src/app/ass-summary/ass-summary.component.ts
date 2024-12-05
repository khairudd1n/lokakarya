import { Component, OnInit } from '@angular/core';
import {
  AssSummaryService,
  GroupAchieveDto,
  GroupAttitudeSkillDto,
} from '../ass-summary.service';
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
import { EmpAchieveService } from '../emp-achieve.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-ass-summary',
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
  templateUrl: './ass-summary.component.html',
  styleUrl: './ass-summary.component.css',
})

export class AssSummaryComponent implements OnInit {
  token: string = localStorage.getItem('token') || '';
  groupAttitudeSkills: GroupAttitudeSkillDto[] = [];
  groupAchievements: GroupAchieveDto[] = [];
  empAchieve:any[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private assSummaryService: AssSummaryService, 
    private empAchieveService: EmpAchieveService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.fetchGroupAttitudeSkills();
    this.fetchGroupAchievements();
    const userId = this.authService.parseJwt(this.token).sub;
    this.fetchEmpAchieveByUserId(userId);
  }

  fetchEmpAchieveByUserId(userId: string): void {
    this.empAchieveService.getAllEmpAchieveByUserId(userId).subscribe({
      next: (data) => {
        const groupedData = data.reduce<Record<string, GroupedData>>((acc, item) => {
          const groupName = item.achievement.group_achievement.group_achievement_name;
          const percentage = item.achievement.group_achievement.percentage;
  
          if (!acc[groupName]) {
            acc[groupName] = { totalScore: 0, percentage: percentage, achievements: [] };
          }
  
          acc[groupName].totalScore += item.score;
          acc[groupName].achievements.push(item);
          return acc;
        }, {});
  
        const result: GroupedResult[] = Object.entries(groupedData).map(([groupName, details]) => ({
          groupName,
          totalScore: details.totalScore,
          percentage: details.percentage, // Now included in the result
          achievements: details.achievements,
        }));
  
        this.empAchieve = result;
        console.log('Grouped Employee Achievements:', this.empAchieve);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching employee achievements:', err);
        this.isLoading = false;
      },
    });
  }
  
  

  fetchGroupAttitudeSkills(): void {
    this.assSummaryService.getAllGroupAttitudeSkills().subscribe({
      next: (data) => {
        this.groupAttitudeSkills = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching group attitude skills:', err);
        this.error = 'Failed to fetch group attitude skills';
        this.isLoading = false;
      },
    });
  }

  fetchGroupAchievements(): void {
    this.assSummaryService.getAllGroupAchievements().subscribe({
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

export interface GroupedData {
  totalScore: number;
  percentage: number;
  achievements: any[]; // Replace `any` with the specific achievement type
}

export interface GroupedResult {
  groupName: string;
  totalScore: number;
  percentage: number;
  achievements: any[]; // Replace `any` with the specific achievement type
}
