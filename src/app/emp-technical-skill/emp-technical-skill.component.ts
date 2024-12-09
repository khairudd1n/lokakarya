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
  userData: EmpTechSkillCreateDto[] = [];
  empTechSkills: EmpTechSkillCreateDto[] = [];

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
    this.fetchData(); // Call the new method to fetch data
  }

  fetchData(): void {
    if (!this.userId) {
      console.error('User ID is missing. Cannot fetch data.');
      return;
    }

    const empTechSkills$ = this.empTechSkillService.getSavedTechs(this.userId);
    const allTechSkills$ = this.empTechSkillService.getAllTechSkill();

    forkJoin([empTechSkills$, allTechSkills$]).subscribe({
      next: ([empTechSkills, allTechSkills]) => {
        this.empTechSkills = empTechSkills;

        // Initialize groupData with allDevPlans
        this.groupData = allTechSkills.map((group) => ({
          ...group,
          rows:
            group.rows?.map((row: Row) => ({
              ...row,
              tech_detail:
                row['user_id'] === this.userId ? row.tech_detail : '', // Check plan_detail based on user_id
              score: row['user_id'] === this.userId ? row.score : '',
              status: row['user_id'] === this.userId ? 'saved' : 'unsaved', // Set status for the rows
            })) || [], // Ensure rows is an empty array if no rows exist
        }));

        // Structure empDevPlans into groups
        const empTechSkillGroups = this.organizeDataIntoGroups(empTechSkills);

        // Merge empDevPlanGroups into groupData
        empTechSkillGroups.forEach((empGroup) => {
          const existingGroup = this.groupData.find(
            (group) => group.technical_skill === empGroup.technical_skill
          );
          if (existingGroup) {
            existingGroup.rows = empGroup.rows; // Update existing group with user-specific plans
          } else {
            this.groupData.push(empGroup); // Add new group if it doesn't exist
          }
        });

        console.log('Fetched EmpTechSkills:', this.empTechSkills);
        console.log('Fetched All Tech Skills:', this.groupData);
      },
      error: (err) => {
        console.error('Error fetching data', err);
      },
    });
  }

  organizeDataIntoGroups(data: EmpTechSkillCreateDto[]): any[] {
    const groups: any[] = [];

    // Group data by plan (you can change the criterion if necessary)
    data.forEach((technical_skill) => {
      const group = groups.find(
        (g) => g.technical_skill === technical_skill.technical_skill
      );
      if (group) {
        group.rows.push(technical_skill); // Add rows to existing group
      } else {
        groups.push({
          technical_skill: technical_skill.technical_skill,
          rows: [technical_skill],
        }); // Create new group
      }
    });
    return groups;
  }

  logTechId2(
    tech_skill_id: string,
    tech_detail: string,
    score: number,
    row: any
  ): void {
    // Check if tech_detail is not empty
    if (tech_detail.trim() !== '') {
      // Create or update the technical_skill object
      const technical_skill: EmpTechSkillCreateDto = {
        user_id: this.userId as UUID,
        tech_skill_id: row.tech_skill_id as UUID,
        technical_skill: row.technical_skill,
        tech_detail,
        score,
        assessment_year: this.assessmentYear,
        status: 'saved',
      };

      // Check if the technical_skill already exists in selectedTechs
      const existingPlanIndex = this.selectedTechs.findIndex(
        (tech) => tech.tech_skill_id === row.tech_skill_id
      );
      console.log('Log parameters:', tech_skill_id, tech_detail, score, row);

      if (existingPlanIndex !== -1) {
        // If it exists, update the existing entry
        this.selectedTechs[existingPlanIndex] = technical_skill;
        console.log('Updated Plan in Selection:', technical_skill);
      } else {
        // If it doesn't exist, add it to selectedTechs
        console.log('Adding Plan to Selection:', technical_skill);
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
    if (this.selectedTechs.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Input keterangan terlebih dahulu.',
      });
      return;
    }

    // Check if any selected tech has a null score
    const hasNullScore = this.selectedTechs.some((tech) => tech.score === null);
    if (hasNullScore) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: 'Pastikan semua tingkat kemahiran telah dipilih.',
      });
      return;
    }

    Swal.fire({
      title: 'Apakah anda yakin ingin menyimpan?',
      text: 'Data yang sudah disimpan tidak dapat diubah lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Final data to be saved:', this.selectedTechs);
        this.empTechSkillService.saveEmpTechSkill(this.selectedTechs).subscribe(
          (response) => {
            console.log('Save successful:', response);
            // Update status in frontend
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
                  row.status = 'saved'; // Mark as "saved"
                }
              }
            });
            this.selectedTechs = []; // Reset selected plans after saving
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Keahlian teknis anda berhasil disimpan',
            });
          },
          (error) => {
            console.error('Save failed:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to save plans.',
            });
          }
        );
      }
    });
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
