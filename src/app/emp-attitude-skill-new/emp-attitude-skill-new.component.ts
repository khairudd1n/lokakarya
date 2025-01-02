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
  EmpAttitudeSkillUpdateRequest,
} from '../emp-attitude-skill-new.service';
import { FormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';
import { forkJoin } from 'rxjs';
import { AssSummaryService } from '../ass-summary.service';
import { TooltipModule } from 'primeng/tooltip';
import { concatMap } from 'rxjs/operators';
import { TagModule } from 'primeng/tag';

interface AttitudeSkill {
  attitude_skill_name: string;
  score: number;
  id: string;
  status: string;
  empAttitudeSkillId: string;
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
    TagModule,
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

  editedSkills: Set<string> = new Set(); // Menyimpan ID skill yang telah diedit

  isDisabled: boolean = false;

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
    })
      .pipe(
        // Setelah forkJoin selesai, kita melanjutkan dengan 'assessmentSummary' menggunakan concatMap
        concatMap(({ groupData, userSkills }) => {
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
                  skill.empAttitudeSkillId = matchedSkill.id;
                }
              });
            });
          }

          console.log('Synchronized Data:', this.groupData);

          // Lanjutkan dengan mengambil assessment summary setelah loadData selesai
          return this.assSummaryService.getAssessmentSummary(
            this.userId,
            this.selectedAssessmentYear
          );
        })
      )
      .subscribe((assessmentSummary) => {
        // Sekarang assessmentSummary bisa diproses setelah loadData selesai
        this.isDisabled = assessmentSummary?.status === 1;
        console.log('Updated isDisabled:', this.isDisabled);
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

  logSkillId(
    attitudeSkillId: string,
    score: number,
    empAttitudeSkillId: string
  ): void {
    console.log('Selected Emp Attitude Skill ID:', empAttitudeSkillId);
    console.log('Selected Attitude Skill ID:', attitudeSkillId);
    console.log('Selected Score:', score);

    const existingSkillIndex = this.selectedSkills.findIndex(
      (skill) => skill.attitude_skill_id === attitudeSkillId
    );

    if (existingSkillIndex !== -1) {
      // Update score jika nilai berbeda
      if (this.selectedSkills[existingSkillIndex].score !== score) {
        this.selectedSkills[existingSkillIndex].score = score;
        this.editedSkills.add(attitudeSkillId); // Tandai sebagai diedit
      }
    } else {
      // Tambahkan skill baru jika belum ada
      const skill: EmpAttitudeSkillCreateDto = {
        user_id: this.userId as UUID,
        attitude_skill_id: attitudeSkillId as UUID,
        score,
        assessment_year: this.assessmentYear,
        id: empAttitudeSkillId as UUID, // Menambahkan ID EmpAttitudeSkill ke objek skill
      };
      this.selectedSkills.push(skill);
      this.editedSkills.add(attitudeSkillId); // Tandai sebagai diedit
    }

    // Update groupData
    this.groupData.forEach((group) => {
      group.attitude_skills.forEach((skill: AttitudeSkill) => {
        if (skill.id === attitudeSkillId) {
          skill.score = score;
        }
      });
    });
  }

  saveSkills(): void {
    const updatedSkills = this.selectedSkills.filter((skill) =>
      this.editedSkills.has(skill.attitude_skill_id)
    );

    console.log('Updated skills:', updatedSkills);

    if (updatedSkills.length === 0) {
      console.log('No changes detected.');
      Swal.fire('Info', 'No changes detected.', 'info');
      return;
    }

    Swal.fire({
      title: 'Confirm Changes',
      text: 'Are you sure you want to save the changes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const newSkills = updatedSkills.filter(
          (skill) => !this.disabledSkills.has(skill.attitude_skill_id)
        );
        const existingSkills = updatedSkills.filter((skill) =>
          this.disabledSkills.has(skill.attitude_skill_id)
        );

        console.log('New skills:', newSkills);
        console.log('Existing skills:', existingSkills);

        const saveNewSkills$ = newSkills.length
          ? this.empAttitudeSkillService.saveEmpAttitudeSkills(newSkills)
          : null;

        // Membuat payload untuk update skills dalam snake_case
        const updatePayload = existingSkills.map((skill) => ({
          id: skill.id,
          attitude_skill_id: skill.attitude_skill_id, // Tetap snake_case
          user_id: skill.user_id, // Tetap snake_case
          assessment_year: skill.assessment_year, // Tetap snake_case
          score: skill.score,
        }));

        const updateSkills$ = existingSkills.length
          ? this.empAttitudeSkillService.updateEmpAttitudeSkills(updatePayload)
          : null;

        console.log('Save new skills observable:', saveNewSkills$);
        console.log('Update skills payload:', updatePayload);

        forkJoin(
          [saveNewSkills$, updateSkills$].filter((obs) => obs !== null)
        ).subscribe(
          () => {
            console.log('Changes saved successfully.');
            Swal.fire(
              'Success',
              'Changes have been successfully saved!',
              'success'
            );
            this.loadData(); // Refresh data
            this.editedSkills.clear(); // Reset edited skills
          },
          (error) => {
            console.error('Failed to save changes:', error);
            Swal.fire('Error', 'Failed to save changes.', 'error');
          }
        );
      } else {
        console.log('User cancelled the confirmation dialog.');
      }
    });
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
