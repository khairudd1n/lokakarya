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
import { forkJoin } from 'rxjs';
import { AssSummaryService } from '../ass-summary.service';
import { TooltipModule } from 'primeng/tooltip';

interface AttitudeSkill {
  attitude_skill_name: string;
  score: number;
  id: string;
  status: string;
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
    TooltipModule,
  ],
  templateUrl: './emp-attitude-skill-new.component.html',
  styleUrl: './emp-attitude-skill-new.component.css',
})
export class EmpAttitudeSkillNewComponent implements OnInit {
  empAttSkills: EmpAttitudeSkillCreateDto[] = [];
  groupData: any[] = [];
  userId: string = ''; // For storing the logged-in userId
  selectedSkills: EmpAttitudeSkillCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();
  disabledSkills: Set<string> = new Set();

  assessmentYears: number[] = []; // Array untuk menampung tahun
  selectedAssessmentYear: number = new Date().getFullYear(); // Tahun yang dipilih

  constructor(
    private http: HttpClient,
    private empAttitudeSkillService: EmpAttitudeSkillNewService,
    private assSummaryService: AssSummaryService
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
    this.loadData();
    this.initializeAssessmentYears();
  }

  // initializeAssessmentYears(): void {
  //   this.empAttitudeSkillService.getAssessmentYears().subscribe(
  //     (years) => {
  //       this.assessmentYears = years; // Isi dropdown dengan tahun yang diterima
  //       if (!this.assessmentYears.includes(this.selectedAssessmentYear)) {
  //         this.selectedAssessmentYear = this.assessmentYears[0]; // Default ke tahun pertama jika tidak ada kecocokan
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching assessment years:', error);
  //     }
  //   );
  // }

  initializeAssessmentYears(): void {
    this.empAttitudeSkillService.getAssessmentYears().subscribe(
      (years) => {
        if (years.length > 0) {
          this.assessmentYears = years;
        } else {
          this.assessmentYears = [new Date().getFullYear()];
        }
        if (!this.assessmentYears.includes(this.selectedAssessmentYear)) {
          this.selectedAssessmentYear = this.assessmentYears[0];
        }
      },
      (error) => {
        console.error('Error fetching assessment years:', error);
      }
    );
  }

  onAssessmentYearChange(): void {
    this.loadData(); // Panggil ulang data ketika tahun berubah
  }

  loadData(): void {
    forkJoin({
      groupData: this.empAttitudeSkillService.getAllGroupWithAttitudeSkills(),
      userSkills: this.userId
        ? this.empAttitudeSkillService.getAllAttitudeSkillsByUserId(
            this.userId,
            this.selectedAssessmentYear
          )
        : [],
    }).subscribe(({ groupData, userSkills }) => {
      this.groupData = groupData;
      console.log('Group Data:', this.groupData);
      console.log('User Skills:', userSkills);

      // Populate scores in groupData with userSkills
      if (userSkills.length > 0) {
        this.disabledSkills = new Set(
          userSkills.map((skill) => skill.attitude_skill.id)
        );
        this.groupData.forEach((group) => {
          group.attitude_skills.forEach((skill: AttitudeSkill) => {
            const matchedSkill = userSkills.find(
              (s) => s.attitude_skill.id === skill.id
            );
            if (matchedSkill) {
              skill.score = matchedSkill.score;
            }
          });
        });
      }
      this.assSummaryService
        .generateAssSummary(this.userId, this.assessmentYear)
        .subscribe((data) => {
          console.log(data);
        });
      console.log('Synchronized Data:', this.groupData);
    });
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
      this.selectedSkills.push(skill);
    }

    // Update the groupData with the new score
    this.groupData.forEach((group) => {
      group.attitude_skills.forEach((skill: AttitudeSkill) => {
        if (skill.id === attitudeSkillId) {
          skill.score = score;
        }
      });
    });
  }

  saveSkills(): void {
    const unfilledCount = this.getUnfilledScoresCount();

    if (unfilledCount > 0) {
      Swal.fire('Warning', 'Input nilai terlebih dahulu.', 'warning');
      return; // Jangan lanjutkan proses simpan
    }

    const filledSkills = this.selectedSkills.filter(
      (skill) =>
        skill.score != null && !this.disabledSkills.has(skill.attitude_skill_id)
    );

    if (filledSkills.length > 0) {
      Swal.fire({
        title: 'Are you sure with your selected score?',
        text: 'Scores that have been submitted cannot be change anymore',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, I am sure!',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.empAttitudeSkillService
            .saveEmpAttitudeSkills(filledSkills)
            .subscribe(
              () => {
                Swal.fire(
                  'Success',
                  'Scores have been successfully submitted!',
                  'success'
                );
                this.loadData(); // Refresh data dari server
              },
              () => Swal.fire('Error', 'Failed to submit scores.', 'error')
            );
        } else {
          Swal.fire('Cancelled', 'Submission cancelled.', 'info');
        }
      });
    } else {
      Swal.fire(
        'Warning',
        'You have already submitted your scores.',
        'warning'
      );
    }
  }

  getUnfilledScoresCount(): number {
    return this.groupData.reduce((total, group) => {
      return (
        total +
        group.attitude_skills.filter(
          (skill: AttitudeSkill) =>
            skill.score === null || skill.score === undefined
        ).length
      );
    }, 0);
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
}
