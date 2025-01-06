import { Component } from '@angular/core';
import {
  SumWithDetailService,
  EmpAttitudeSkillDto,
} from '../sum-with-detail.service';
import { CommonModule } from '@angular/common';

interface GroupedSkills {
  group_name: string;
  skills: { attitude_skill_name: string; score: number }[];
}

@Component({
  selector: 'app-sum-with-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sum-with-detail.component.html',
  styleUrl: './sum-with-detail.component.css',
})
export class SumWithDetailComponent {
  userId: string = '';
  year: number = new Date().getFullYear();
  empAttitudeSkills: EmpAttitudeSkillDto[] = [];
  groupedSkills: GroupedSkills[] = [];
  errorMessage: string = '';

  constructor(private sumWithDetailService: SumWithDetailService) {}

  ngOnInit(): void {
    this.getUserId();

    if (this.userId) {
      this.fetchEmpAttitudeSkills();
    } else {
      this.errorMessage = 'User ID is required to fetch data.';
    }
  }

  getUserId(): void {
    const userToken = localStorage.getItem('token');

    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1]));
        console.log('Full Token Payload:', payload);

        this.userId = payload.sub;
        console.log('Logged-in User ID:', this.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found in localStorage.');
    }
  }

  fetchEmpAttitudeSkills(): void {
    this.sumWithDetailService
      .getEmpAttSkillByUserId(this.userId, this.year)
      .subscribe({
        next: (response) => {
          console.log('Response received:', response);

          if (response && response.content) {
            console.log('Content:', response.content);
            if (
              Array.isArray(response.content) &&
              response.content.length > 0
            ) {
              this.empAttitudeSkills = response.content.map((skill) => ({
                id: skill.id,
                attitude_skill: {
                  attitude_skill_name: skill.attitude_skill.attitude_skill_name,
                },
                score: skill.score,
                assessment_year: skill.assessment_year,
                group_attitude_skill: skill.group_attitude_skill,
                created_at: skill.created_at,
                created_by: skill.created_by,
                enabled: skill.enabled,
              }));
              this.groupSkillsByGroupName();
            } else {
              this.errorMessage = 'No skills data found.';
              console.warn(
                'Content is empty or not an array:',
                response.content
              );
            }
          } else {
            this.errorMessage = 'No skills data found.';
            console.warn('Response does not contain content:', response);
          }
        },
        error: (err) => {
          this.errorMessage = `Error fetching data: ${err.message}`;
          console.error(this.errorMessage);
        },
      });
  }

  groupSkillsByGroupName(): void {
    if (!this.empAttitudeSkills || !Array.isArray(this.empAttitudeSkills)) {
      console.error('empAttitudeSkills is not defined or not an array');
      return;
    }

    const grouped: {
      [key: string]: { attitude_skill_name: string; score: number }[];
    } = {};

    this.empAttitudeSkills.forEach((skill) => {
      const groupName = skill.group_attitude_skill.group_name;
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push({
        attitude_skill_name: skill.attitude_skill.attitude_skill_name,
        score: skill.score,
      });
    });

    this.groupedSkills = Object.keys(grouped).map((group_name) => ({
      group_name,
      skills: grouped[group_name],
    }));
  }
}
