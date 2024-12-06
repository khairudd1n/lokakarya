import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  AssSummaryService,
  GroupAchieveDto,
  GroupAttitudeSkillDto,
} from '../../ass-summary.service';
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
import { EmpAchieveService } from '../../emp-achieve.service';
import { AuthService } from '../../core/services/auth.service';
import { NavBarComponent } from '../nav-bar/nav-bar/nav-bar.component';
import { EmpAttitudeSkillNewService } from '../../emp-attitude-skill-new.service';
import { forkJoin } from 'rxjs';
import { GroupAttitudeSkillService } from '../../core/services/group-attitude-skill.service';
import { GroupAchievementsService } from '../../core/services/group-achievements.service';
import { group } from 'console';

@Component({
  selector: 'app-user-summary',
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
  templateUrl: './user-summary.component.html',
  styleUrl: './user-summary.component.css',
})
export class UserSummaryComponent implements OnInit, OnChanges {

  @Input() userId: string | null = null;
  @Input() isInDialog: boolean = false;
  
  token: string = localStorage.getItem('token') || '';
  empAchieve: any[] = [];
  groupAttitudeSkills:any[] = [];
  groupAchievement:any[] = [];
  empAttitude: any[] = [];
  combinedData: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  id: string = '';
  totalWeight: number = 0;

  constructor(
    private empAchieveService: EmpAchieveService,
    private authService: AuthService,
    private empAttitudeSkillService: EmpAttitudeSkillNewService,
    private groupAttitudeSkillService: GroupAttitudeSkillService,
    private groupAchievementService: GroupAchievementsService
  ) {}

  ngOnInit(): void {
    if(!this.userId){
      this.id = this.authService.parseJwt(this.token).sub;
    }
    this.fetchCombinedData(this.id);
  }

  ngOnChanges(): void {
    if (this.userId) {
      this.fetchCombinedData(this.userId);
    }
  }

  fetchCombinedData(userId: string): void {
    this.isLoading = true;
  
    forkJoin({
      empAttitude: this.empAttitudeSkillService.getAllAttitudeSkillsByUserId(userId),
      empAchieve: this.empAchieveService.getAllEmpAchieveByUserId(userId),
      groupAttitude: this.groupAttitudeSkillService.getAllGroupAttitudeSkillWithCount(),
      groupAchievement: this.groupAchievementService.getAllGroupAchievementWithCount(),
    }).subscribe({
      next: (results) => {
        const combinedData = [];

        this.groupAttitudeSkills = results.groupAttitude;
        this.groupAchievement = results.groupAchievement;
        console.log(this.groupAchievement);
  
        const achieveGrouped = this.groupDataByCategory(
          results.empAchieve,
          (item) => item.achievement.group_achievement.group_achievement_name,
          (item) => item.achievement.group_achievement.percentage,
          'Achievements'
        );
        combinedData.push(...achieveGrouped);

        const attitudeGrouped = this.groupDataByCategory(
          results.empAttitude,
          (item) => item.attitude_skill.group_attitude_skill.group_name,
          (item) => item.attitude_skill.group_attitude_skill.percentage,
          'Attitude and Skills'
        );
        combinedData.push(...attitudeGrouped);
  
        this.combinedData = combinedData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching combined data:', err);
        this.isLoading = false;
      },
    });
  }

  groupDataByCategory(
    data: any[],
    groupNameFn: (item: any) => string,
    percentageFn: (item: any) => number,
    section: string
  ): GroupedResult[] {
    const groupedData = data.reduce<Record<string, GroupedData>>((acc, item) => {
      const groupName = groupNameFn(item);
      const percentage = percentageFn(item);
  
      if (!acc[groupName]) {
        acc[groupName] = {
          totalScore: 0,
          percentage: percentage,
          items: [],
        };
      }
  
      acc[groupName].totalScore += item.score;
      acc[groupName].items.push(item);
      return acc;
    }, {});
  
    const result: GroupedResult[] = Object.entries(groupedData).map(
      ([groupName, details]) => {
        var count: number = 0;
        if(section === 'Attitude and Skills'){
          const group = this.groupAttitudeSkills.find(
            (g) => g.group_name === groupName
          );
          count = group ? group.attitude_count : 1;
        }else{
          const group = this.groupAchievement.find(
            (g) => g.group_achievement_name === groupName
          );
          count = group ? group.achievement_count : 1;
        }
  
        return {
          section,
          groupName,
          totalScore: details.totalScore/count,
          percentage: details.percentage,
          items: details.items,
        };
      }
    );
  
    return result;
  }

  isNewSection(index: number, currentSection: string): boolean {
    if (index === 0) return true; // Always show the section header for the first item
    const previousSection = this.combinedData[index - 1].section;
    return previousSection !== currentSection; // Show header if the section changes
  }
  
}

export interface GroupedData {
  totalScore: number;
  percentage: number;
  items: any[];
}

export interface GroupedResult {
  section: string;
  groupName: string;
  totalScore: number;
  percentage: number;
  items: any[];
}
