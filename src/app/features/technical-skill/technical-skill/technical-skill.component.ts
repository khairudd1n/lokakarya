import { Component, ViewChild, viewChild } from '@angular/core';
import { TechnicalSkillService } from '../../../core/services/technical-skill.service';
import { error } from 'console';
import { TechnicalSkill } from '../../../core/models/technical-skill.model';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { CreateTechSkillDialogComponent } from '../create-tech-skill-dialog/create-tech-skill-dialog.component';
import Swal from 'sweetalert2';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-technical-skill',
  standalone: true,
  imports: [SharedModule, CreateTechSkillDialogComponent, TagModule],
  templateUrl: './technical-skill.component.html',
  styleUrl: './technical-skill.component.css',
})
export class TechnicalSkillComponent {
  technicalSkills: TechnicalSkill[] = [];
  selectedTechSkill: TechnicalSkill | null = null;
  displayDialog: boolean = false;
  nameList: string[] = [];

  constructor(private techSkillService: TechnicalSkillService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.techSkillService.getAll().subscribe({
      next: (data) => {
        this.technicalSkills = data.content;
        const technical_skills = this.technicalSkills
          .map((techSkill) => techSkill.technical_skill?.toLowerCase())
          .filter(
            (name): name is string => name !== null && name !== undefined
          );

        if (technical_skills.length > 0) {
          this.nameList = technical_skills;
        }

        console.log(this.technicalSkills);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  openCreateDialog() {
    this.displayDialog = true;
    this.selectedTechSkill = null;
  }

  openEditDialog(techSkill: TechnicalSkill) {
    this.selectedTechSkill = techSkill;
    this.displayDialog = true;
  }

  onTechSkillSaved(techSkill: TechnicalSkill) {
    techSkill.enabled = techSkill.enabled ? 1 : 0;
    if (this.selectedTechSkill) {
      if (
        this.selectedTechSkill?.technical_skill === techSkill.technical_skill
      ) {
        techSkill.technical_skill = null;
      }
      if (this.selectedTechSkill?.enabled === techSkill.enabled) {
        techSkill.enabled = null;
      }
      this.techSkillService.update(techSkill).subscribe({
        next: (data) => {
          console.log(data);
          Swal.fire({
            title: 'Success!',
            text: 'Technical Skill updated successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
          this.selectedTechSkill = null;
          this.loadData();
        },
        error: (err) => {
          console.log(err);
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to update Technical Skill. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        },
      });
    } else {
      this.techSkillService.save(techSkill).subscribe({
        next: (data) => {
          console.log(data);
          Swal.fire({
            title: 'Success!',
            text: 'Technical Skill created successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          });
          this.selectedTechSkill = null;
          this.loadData();
        },
        error: (err) => {
          console.log(err);
          Swal.fire({
            title: 'Failed!',
            text: 'Failed to create Technical Skill. Please try again.',
            icon: 'error',
            confirmButtonColor: '#d33',
          });
        },
      });
    }
    this.displayDialog = false;
  }

  @ViewChild('dt1') dt1: any;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.dt1.filterGlobal(input, 'contains');
    }
  }

  clearFilters(table: any): void {
    table.clear();
    const globalSearchInput = document.querySelector(
      '.p-input-icon-left input'
    ) as HTMLInputElement;
    if (globalSearchInput) {
      globalSearchInput.value = ''; // Clear the input field
    }
  }

  onDelete(techSkill: any) {
    console.log(techSkill);
    this.techSkillService.delete(techSkill.id).subscribe({
      next: (data) => {
        console.log(data);
        Swal.fire({
          title: 'Success!',
          text: 'Technical Skill deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
        this.loadData();
      },
      error: (err) => {
        console.log(err);
        Swal.fire({
          title: 'Failed!',
          text: 'Failed to delete Technical Skill. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      },
    });
  }
}
