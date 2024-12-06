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
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';

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
    NavBarComponent,
  ],
  templateUrl: './ass-summary.component.html',
  styleUrl: './ass-summary.component.css',
})
export class AssSummaryComponent implements OnInit {
  token: string = localStorage.getItem('token') || '';
  groupAttitudeSkills: GroupAttitudeSkillDto[] = [];
  groupAchievements: GroupAchieveDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private assSummaryService: AssSummaryService) {}

  ngOnInit(): void {
    this.fetchGroupAttitudeSkills();
    this.fetchGroupAchievements();
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
