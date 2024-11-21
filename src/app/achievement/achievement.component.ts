import { Component, OnInit } from '@angular/core';
import { AchieveDto, AchievementService } from '../achievement.service';
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
  ],
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

  clear(table: Table) {
    table.clear();
  }
}
