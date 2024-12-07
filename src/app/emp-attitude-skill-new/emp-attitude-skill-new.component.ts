import { Component, OnInit } from '@angular/core';
import {
  GroupAttitudeSkillService,
  GroupAttWithAttDto,
} from '../core/services/group-attitude-skill.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableModule } from 'primeng/table'; // For table
import { InputNumberModule } from 'primeng/inputnumber'; // For number input
import { ButtonModule } from 'primeng/button';
import {
  EmpAttitudeSkillNewService,
  EmpAttitudeSkillCreateDto,
} from '../emp-attitude-skill-new.service';
import { FormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';

interface AttitudeSkill {
  attitude_skill_name: string;
  score: number;
  id: string;
}

@Component({
  selector: 'app-emp-attitude-skill-new',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    FormsModule,
    DropdownModule,
    NavBarComponent,
  ],
  templateUrl: './emp-attitude-skill-new.component.html',
  styleUrl: './emp-attitude-skill-new.component.css',
})
export class EmpAttitudeSkillNewComponent implements OnInit {
  groupData: any[] = [];
  userId: string = ''; // For storing the logged-in userId
  selectedSkills: EmpAttitudeSkillCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();
  disabledSkills: Set<string> = new Set();

  constructor(
    private http: HttpClient,
    private empAttitudeSkillService: EmpAttitudeSkillNewService
  ) {}

  scoreOptions = [
    { label: 'Sangat Baik', value: 100 },
    { label: 'Baik', value: 80 },
    { label: 'Cukup', value: 60 },
    { label: 'Kurang', value: 40 },
    { label: 'Sangat Kurang', value: 20 },
  ];

  ngOnInit(): void {
    this.getUserId();
    this.getAllGroupWithAttitudeSkills().subscribe((data) => {
      this.groupData = data;

      // Load disabled skills from local storage
      const submittedSkills = JSON.parse(
        localStorage.getItem(`submittedSkills_${this.userId}`) || '[]'
      );
      submittedSkills.forEach((skillId: string) =>
        this.disabledSkills.add(skillId)
      );

      console.log('Fetched groupData:', this.groupData);
    });
  }

  getAllGroupWithAttitudeSkills(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<any[]>(`${this.apiUrl2}`, { headers })
      .pipe(
        tap((data) =>
          console.log('Fetched Group Attitude with Attitude skills:', data)
        )
      );
  }

  getUserId(): void {
    const userToken = localStorage.getItem('token');

    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1])); // Decode JWT payload
        console.log('Full Token Payload:', payload);

        // Extract userId from the 'sub' key
        this.userId = payload.sub;
        console.log('Logged-in User ID:', this.userId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found in localStorage.');
    }
  }

  logSkillId(attitudeSkillId: string, score: number): void {
    console.log(
      'Selected Attitude Skill ID:',
      attitudeSkillId,
      'Score:',
      score
    );
    const existingSkillIndex = this.selectedSkills.findIndex(
      (skill) => skill.attitude_skill_id === attitudeSkillId
    );

    if (existingSkillIndex !== -1) {
      // Update the existing skill if it already exists
      this.selectedSkills[existingSkillIndex].score = score;
    } else {
      // Create a new skill object if it doesn't exist
      const skill: EmpAttitudeSkillCreateDto = {
        user_id: this.userId as UUID,
        attitude_skill_id: attitudeSkillId as UUID,
        score,
        assessment_year: this.assessmentYear,
      };
      console.log('Adding Skill to Selection:', skill);
      this.selectedSkills.push(skill);
    }
  }

  saveSkills(): void {
    // Filter selectedSkills untuk memastikan ada data yang diisi
    const filledSkills = this.selectedSkills.filter(
      (skill) => skill.score !== null && skill.score !== undefined
    );

    if (filledSkills.length > 0) {
      this.empAttitudeSkillService
        .saveEmpAttitudeSkills(filledSkills)
        .subscribe(
          (response) => {
            console.log('Save successful:', response);
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Skills saved successfully!',
            }).then(() => {
              // Simpan skill yang sudah diisi ke localStorage
              const submittedSkills = filledSkills.map(
                (skill) => skill.attitude_skill_id
              );
              const existingData = JSON.parse(
                localStorage.getItem(`submittedSkills_${this.userId}`) || '[]'
              );
              localStorage.setItem(
                `submittedSkills_${this.userId}`,
                JSON.stringify([...existingData, ...submittedSkills])
              );

              // Update disabledSkills
              submittedSkills.forEach((skillId) =>
                this.disabledSkills.add(skillId)
              );

              // Refresh data tanpa reload halaman
              this.getAllGroupWithAttitudeSkills().subscribe((data) => {
                this.groupData = data;
              });
            });
          },
          (error) => {
            console.error('Save failed:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to save skills.',
            });
          }
        );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Input nilai terlebih dahulu.',
      });
    }
  }

  getStatusText(skillId: string): string {
    return this.disabledSkills.has(skillId) ? 'Sudah diisi' : 'Belum diisi';
  }

  getStatusColor(skillId: string): string {
    return this.disabledSkills.has(skillId) ? 'green' : 'orange';
  }
  isSkillDisabled(skillId: string): boolean {
    return this.disabledSkills.has(skillId);
  }

  isSaveDisabled(): boolean {
    // Periksa apakah semua skill dalam group memiliki nilai 'score' yang valid
    return this.groupData.some((group) =>
      group.attitude_skills.some(
        (skill: AttitudeSkill) =>
          skill.score === null || skill.score === undefined
      )
    );
  }

  // Function to calculate the total score for a group
  getTotalScore(group: any): number {
    return group.attitude_skills.reduce(
      (total: number, skill: AttitudeSkill) => total + (skill.score || 0),
      0
    );
  }

  token: string = localStorage.getItem('token') || '';
  private apiUrl2 = 'http://localhost:8080/group-attitude-skill/all';
}
