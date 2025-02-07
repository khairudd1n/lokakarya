import { Component } from '@angular/core';
import {
  EmpTechnicalSkillService,
  EmpTechSkillCreateDto,
} from '../emp-technical-skill.service';
import { HttpClient } from '@angular/common/http';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';
import { forkJoin } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';

interface Row {
  technical_skill: string;
  tech_detail: string;
  score: number;
  tech_skill_id?: string;
  status: string;
  [key: string]: any;
}

interface Group {
  id: string;
  rows: Row[];
  [key: string]: any;
}

@Component({
  selector: 'app-emp-technical-skill',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputNumberModule,
    ButtonModule,
    DropdownModule,
    NavBarComponent,
    TooltipModule,
    InputIconModule,
    InputTextModule,
    IconFieldModule,
  ],
  templateUrl: './emp-technical-skill.component.html',
  styleUrls: ['./emp-technical-skill.component.css'],
})
export class EmpTechnicalSkillComponent {
  groupData: any[] = [];
  userId: string = '';
  selectedTechs: EmpTechSkillCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();
  userData: EmpTechSkillCreateDto[] = [];
  empTechSkills: EmpTechSkillCreateDto[] = [];

  assessmentYears: Set<number>= new Set(); // Array untuk menampung tahun
  selectedAssessmentYear: number = new Date().getFullYear(); // Tahun yang dipilih

  isPreviousYearSelected: boolean = false;

  constructor(
    private http: HttpClient,
    private empTechSkillService: EmpTechnicalSkillService
  ) {}

  scoreOptions = [
    { label: 'Ahli', value: 5 },
    { label: 'Advance', value: 4 },
    { label: 'Praktisi', value: 3 },
    { label: 'Memahami', value: 2 },
    { label: 'Berpengetahuan', value: 1 },
  ];

  ngOnInit(): void {
    this.getUserId();
    this.fetchData();
    this.initializeAssessmentYears();
  }

  initializeAssessmentYears(): void {
    this.empTechSkillService.getAssessmentYears().subscribe(
      (years) => {
        if (years.length > 0) {
          this.assessmentYears.add(new Date().getFullYear());
          years.forEach(year => this.assessmentYears.add(year));        
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
    this.isPreviousYearSelected =
      this.selectedAssessmentYear < this.assessmentYear;
    this.fetchData();
  }

  fetchData(): void {
    if (!this.userId) {
      console.error('User ID is missing. Cannot fetch data.');
      return;
    }

    const empTechSkills$ =
      this.empTechSkillService.getEmpTechSkillByUserIdAndYear(
        this.userId,
        this.selectedAssessmentYear
      );
    const allTechSkills$ = this.empTechSkillService.getAllTechSkill();

    forkJoin([empTechSkills$, allTechSkills$]).subscribe({
      next: ([empTechSkills, allTechSkills]) => {
        this.empTechSkills = empTechSkills;

        this.groupData = allTechSkills.map((group) => ({
          ...group,
          rows:
            group.rows?.map((row: Row) => ({
              ...row,
              tech_detail:
                row['user_id'] === this.userId ? row.tech_detail : '',
              score: row['user_id'] === this.userId ? row.score : '',
              status: row['user_id'] === this.userId ? 'saved' : 'unsaved',
            })) || [],
        }));

        const empTechSkillGroups = this.organizeDataIntoGroups(empTechSkills);
        

        empTechSkillGroups.forEach((empGroup) => {
          const existingGroup = this.groupData.find(
            (group) => group.technical_skill === empGroup.technical_skill
          );
          if (existingGroup) {
            existingGroup.rows = empGroup.rows;
          } else {
            this.groupData.push(empGroup);
          }
        });
        
        
      },
      error: (err) => {
        console.error('Error fetching data', err);
      },
    });
  }

  organizeDataIntoGroups(data: any[]): any[] {
    const groups: any[] = [];

    data.forEach((technical_skill) => {
      const group = groups.find(
        (g) => g.technical_skill === technical_skill.tech_skill.technical_skill
      );
      if (group) {
        group.rows.push(technical_skill);
      } else {
        groups.push({
          technical_skill: technical_skill.tech_skill.technical_skill,
          rows: [technical_skill],
        });
      }
    });
    return groups;
  }

  logTechId2(
    tech_skill_id: string,
    tech_detail: string,
    score: number,
    row: Row
  ): void {
    if (tech_detail.trim() !== '' && score !== null) {
      const technical_skill: EmpTechSkillCreateDto = {
        user_id: this.userId as UUID,
        tech_skill_id: row.tech_skill_id as UUID,
        technical_skill: row.technical_skill,
        tech_detail,
        score,
        assessment_year: this.assessmentYear,
        status: 'saved',
      };

      const existingPlanIndex = this.selectedTechs.findIndex(
        (tech) =>
          tech.tech_skill_id === row.tech_skill_id &&
          tech.tech_detail === tech_detail &&
          tech.score === score
      );

      if (existingPlanIndex !== -1) {
        this.selectedTechs[existingPlanIndex] = technical_skill;
        
      } else {
        
        this.selectedTechs.push(technical_skill);
      }
    }
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

  saveTechs(): void {
    this.selectedTechs = [];

    this.groupData.forEach((group: Group) => {
      group.rows.forEach((row: Row) => {
        if (
          row.tech_detail.trim() !== '' &&
          row.score !== null &&
          row.status !== 'saved'
        ) {
          const technical_skill: EmpTechSkillCreateDto = {
            user_id: this.userId as UUID,
            tech_skill_id: row.tech_skill_id as UUID,
            technical_skill: row.technical_skill,
            tech_detail: row.tech_detail,
            score: row.score,
            assessment_year: this.selectedAssessmentYear,
            status: 'saved',
          };
          this.selectedTechs.push(technical_skill);
        }
      });
    });

    if (this.selectedTechs.length > 0) {
      Swal.fire({
        title: 'Are you sure you want to submit?',
        text: 'All data that have been submitted cannot be change anymore.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, I am sure',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          
          this.empTechSkillService
            .saveEmpTechSkill(this.selectedTechs)
            .subscribe(
              (response) => {
                

                this.selectedTechs.forEach((technical_skill) => {
                  const group = this.groupData.find(
                    (grp) => grp.id === technical_skill.tech_skill_id
                  );
                  if (group) {
                    const row = group.rows.find(
                      (r: Row) =>
                        r.tech_detail === technical_skill.tech_detail &&
                        r.score === technical_skill.score
                    );
                    if (row) {
                      row.status = 'saved';
                    }
                  }
                });
                this.selectedTechs = [];
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text: 'Your data has been submitted successfully.',
                });
              },
              (error) => {
                console.error('Save failed:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: 'Fill in the skill level first.',
                });
              }
            );
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Fill in the description first.',
      });
    }
  }

  addRow(group: any): void {
    const newRow = {
      technical_skill: group.technical_skill,
      tech_detail: '',
      score: '',
      tech_skill_id: group.id,
      status: 'unsaved',
    };
    
    group.rows.push(newRow);
  }

  deleteRow(group: any, rowIndex: number): void {
    group.rows.splice(rowIndex, 1);
  }
}
