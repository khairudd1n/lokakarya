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
  ],
  templateUrl: './emp-technical-skill.component.html',
  styleUrls: ['./emp-technical-skill.component.css'],
})
export class EmpTechnicalSkillComponent {
  groupData: any[] = [];
  userId: string = '';
  selectedTechs: EmpTechSkillCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();
  isSubmitted: boolean = false;

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
    console.log('User  ID:', this.userId); // Log user ID

    this.empTechSkillService.getAllTechSkill().subscribe((data: Group[]) => {
      console.log('Fetched all tech skills:', data); // Log all tech skills

      this.empTechSkillService
        .getSavedTechs(this.userId)
        .subscribe((savedSkills: EmpTechSkillCreateDto[]) => {
          console.log('Fetched saved skills:', savedSkills); // Log saved skills

          this.groupData = data.map((group) => ({
            ...group,
            rows: group.rows?.map((row: Row) => {
              const savedSkill = savedSkills.find(
                (skill) =>
                  skill.tech_skill_id === group.id && // Ensure this matches your data structure
                  skill.user_id === this.userId
              );
              return {
                ...row,
                tech_skill_id: group.id,
                tech_detail: savedSkill?.tech_detail || '',
                score: savedSkill?.score || null,
                status: savedSkill ? 'saved' : 'unsaved',
              };
            }) || [
              {
                tech_detail: '',
                score: null,
                tech_skill_id: group.id,
                status: 'unsaved',
              },
            ],
          }));
          console.log('Loaded Tech Skills with saved data:', this.groupData);
        });
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

  logTechId(
    tech_skill_id: string,
    tech_detail: string,
    score: number,
    row: any
  ): void {
    const existingTechIndex = this.selectedTechs.findIndex(
      (tech) =>
        tech.tech_skill_id === row.tech_skill_id &&
        tech.tech_detail === tech_detail
    );

    if (existingTechIndex !== -1) {
      this.selectedTechs[existingTechIndex].tech_detail = tech_detail;
      this.selectedTechs[existingTechIndex].score = score;
    } else {
      const tech: EmpTechSkillCreateDto = {
        user_id: this.userId as UUID,
        tech_skill_id: row.tech_skill_id as UUID,
        technical_skill: row.technical_skill,
        tech_detail,
        score,
        assessment_year: this.assessmentYear,
        status: 'saved',
      };
      this.selectedTechs.push(tech);
      row.status = 'saved'; // Mark row as saved
    }
  }

  saveTechs(): void {
    if (this.selectedTechs.some((tech) => !tech.score)) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Pastikan semua tingkat kemahiran telah dipilih.',
      });
      return;
    }
    if (this.selectedTechs.length > 0) {
      console.log('Final data to be saved:', this.selectedTechs);
      this.empTechSkillService.saveEmpTechSkill(this.selectedTechs).subscribe(
        (response) => {
          console.log('Save successful:', response);
          this.isSubmitted = true; // Set to true after successful save
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Techs saved successfully!',
          });
        },
        (error) => {
          console.error('Save failed:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to save techs.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Input keterangan terlebih dahulu.',
      });
    }
  }

  addRow(group: any): void {
    const newRow = {
      technical_skill: group.technical_skill,
      tech_detail: '',
      score: '',
      tech_skill_id: group.id,
      status: 'unsaved', // Mark new rows as unsaved
    };
    console.log('Adding new row:', newRow);
    group.rows.push(newRow);
  }

  deleteRow(group: any, rowIndex: number): void {
    group.rows.splice(rowIndex, 1);
  }
}
