import { Component } from '@angular/core';
import {
  EmpTechnicalSkillService,
  EmpTechSkillCreateDto,
} from '../emp-technical-skill.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ApiResponse } from '../core/models/api-response.model';
import { DropdownModule } from 'primeng/dropdown';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';

interface Row {
  technical_skill: string;
  tech_detail: string;
  score: number;
  tech_skill_id?: string;
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
  styleUrl: './emp-technical-skill.component.css',
})
export class EmpTechnicalSkillComponent {
  token: string = localStorage.getItem('token') || '';
  private apiUrl2 = 'http://localhost:8080/tech-skill/all';

  groupData: any[] = [];
  userId: string = '';
  selectedTechs: EmpTechSkillCreateDto[] = [];
  assessmentYear: number = new Date().getFullYear();

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
    this.getAllTechSkill().subscribe((data: Group[]) => {
      // Type the data as an array of Group
      this.groupData = data.map((group) => ({
        ...group,
        rows: group.rows?.map((row: Row) => ({
          // Explicitly type the row parameter
          ...row,
          tech_skill_id: group.id, // Add tech_skill_id to each row
        })) || [{ tech_detail: '', score: '', tech_skill_id: group.id }], // Ensure dev_plan_id is included if rows are empty
      }));
      console.log('Fetched Tech Skill:', this.groupData);
    });
  }

  getAllTechSkill(): Observable<any[]> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };
    return this.http
      .get<ApiResponse<any[]>>(`${this.apiUrl2}`, { headers })
      .pipe(map((response) => response.content));
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

  // logTechId(
  //   tech_skill_id: string,
  //   tech_detail: string,
  //   score: number,
  //   row: any
  // ): void {
  //   // Use the dev_plan_id from the row itself
  //   const existingTechIndex = this.selectedTechs.findIndex(
  //     (tech) => tech.tech_skill_id === row.tech_skill_id // Match using row.dev_plan_id
  //   );

  //   if (existingTechIndex !== -1) {
  //     // Update the existing plan if it already exists
  //     this.selectedTechs[existingTechIndex].tech_detail = tech_detail;
  //   } else {
  //     // Create a new plan object if it doesn't exist
  //     const tech: EmpTechSkillCreateDto = {
  //       user_id: this.userId as UUID,
  //       tech_skill_id: row.tech_skill_id as UUID, // Use dev_plan_id from the row
  //       technical_skill: row.technical_skill,
  //       tech_detail,
  //       score,
  //       assessment_year: this.assessmentYear,
  //     };
  //     console.log('Adding Tech to Selection:', tech);
  //     this.selectedTechs.push(tech);
  //   }
  // }

  logTechId(
    tech_skill_id: string,
    tech_detail: string,
    score: number,
    row: any
  ): void {
    const existingTechIndex = this.selectedTechs.findIndex(
      (tech) => tech.tech_skill_id === row.tech_skill_id
    );

    if (existingTechIndex !== -1) {
      // Update jika item sudah ada
      this.selectedTechs[existingTechIndex].tech_detail = tech_detail;
      this.selectedTechs[existingTechIndex].score = score; // Update score
    } else {
      // Buat baru jika belum ada
      const tech: EmpTechSkillCreateDto = {
        user_id: this.userId as UUID,
        tech_skill_id: row.tech_skill_id as UUID,
        technical_skill: row.technical_skill,
        tech_detail,
        score,
        assessment_year: this.assessmentYear,
      };
      this.selectedTechs.push(tech);
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
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Techs saved successfully!',
          }).then(() => {});
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
    };
    console.log('Adding new row:', newRow);
    group.rows.push(newRow);
  }

  deleteRow(group: any, rowIndex: number): void {
    group.rows.splice(rowIndex, 1);
  }
}
