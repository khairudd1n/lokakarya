import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
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
  userId: string = '';
  selectedSkills: EmpAttitudeSkillCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();
  disabledSkills: Set<string> = new Set();

  assessmentYears: Set<number> = new Set();
  selectedAssessmentYear: number = new Date().getFullYear();

  editedSkills: Set<string> = new Set();

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
          this.assessmentYears.add(new Date().getFullYear());
          years.forEach((year) => this.assessmentYears.add(year));
        } else {
          this.assessmentYears.add(new Date().getFullYear());
        }
      },
      (error) => {
        console.error('Error fetching assessment years:', error);
      }
    );
  }

  onAssessmentYearChange(): void {
    this.loadData();
    if(this.selectedAssessmentYear < this.assessmentYear) {
      this.isDisabled = true;
    }
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
        concatMap(({ groupData, userSkills }) => {
          this.groupData = groupData;         
          

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

          

          return this.assSummaryService.getAssessmentSummary(
            this.userId,
            this.selectedAssessmentYear
          );
        })
      )
      .subscribe((assessmentSummary) => {
        this.isDisabled = assessmentSummary?.status === 1;
        
      });
  }

  getUserId(): void {
    const userToken = localStorage.getItem('token');

    if (userToken) {
      try {
        const payload = JSON.parse(atob(userToken.split('.')[1]));
        

        this.userId = payload.sub;
        
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
    
    
    

    const existingSkillIndex = this.selectedSkills.findIndex(
      (skill) => skill.attitude_skill_id === attitudeSkillId
    );

    if (existingSkillIndex !== -1) {
      if (this.selectedSkills[existingSkillIndex].score !== score) {
        this.selectedSkills[existingSkillIndex].score = score;
        this.editedSkills.add(attitudeSkillId);
      }
    } else {
      const skill: EmpAttitudeSkillCreateDto = {
        user_id: this.userId as UUID,
        attitude_skill_id: attitudeSkillId as UUID,
        score,
        assessment_year: this.assessmentYear,
        id: empAttitudeSkillId as UUID,
      };
      this.selectedSkills.push(skill);
      this.editedSkills.add(attitudeSkillId);
    }

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

    

    if (updatedSkills.length === 0) {
      
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

        
        

        const saveNewSkills$ = newSkills.length
          ? this.empAttitudeSkillService.saveEmpAttitudeSkills(newSkills)
          : null;

        const updatePayload = existingSkills.map((skill) => ({
          id: skill.id,
          attitude_skill_id: skill.attitude_skill_id,
          user_id: skill.user_id,
          assessment_year: skill.assessment_year,
          score: skill.score,
        }));

        const updateSkills$ = existingSkills.length
          ? this.empAttitudeSkillService.updateEmpAttitudeSkills(updatePayload)
          : null;

        
        

        forkJoin(
          [saveNewSkills$, updateSkills$].filter((obs) => obs !== null)
        ).subscribe(
          () => {
            
            Swal.fire(
              'Success',
              'Changes have been successfully saved!',
              'success'
            );
            this.selectedSkills = [];
            this.loadData();
            this.editedSkills.clear();
          },
          (error) => {
            console.error('Failed to save changes:', error);
            Swal.fire('Error', 'Failed to save changes.', 'error');
          }
        );
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
    return this.groupData.some((group) =>
      group.attitude_skills.some(
        (skill: AttitudeSkill) =>
          skill.score === null || skill.score === undefined
      )
    );
  }

  getTotalScore(group: any): number {
    return group.attitude_skills.reduce(
      (total: number, skill: AttitudeSkill) => total + (skill.score || 0),
      0
    );
  }
}
