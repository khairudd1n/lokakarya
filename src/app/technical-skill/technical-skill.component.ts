import { Component, OnInit } from '@angular/core';
import {
  TechSkillDto,
  TechnicalSkillService,
} from '../technical-skill.service';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-technical-skill',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TableModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    DropdownModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    MenubarModule,
  ],
  templateUrl: './technical-skill.component.html',
  styleUrl: './technical-skill.component.css',
})
export class TechnicalSkillComponent implements OnInit {
  techSkills: TechSkillDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  newTechnicalSkill: Partial<TechSkillDto> = {
    technical_skill: '',
    enabled: 1,
  };

  constructor(private techSkillService: TechnicalSkillService) {}

  ngOnInit(): void {
    this.fetchTechSkills();
  }

  fetchTechSkills(): void {
    this.techSkillService.findAll().subscribe({
      next: (data) => {
        this.techSkills = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tech skills:', err);
        this.error = 'Failed to fetch tech skills';
        this.isLoading = false;
      },
    });
  }

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  createTecnicalSkill(): void {
    if (!this.newTechnicalSkill.technical_skill === undefined) {
      return;
    }

    this.techSkillService.save(this.newTechnicalSkill).subscribe({
      next: (newTechnicalSkill) => {
        this.techSkills.push(newTechnicalSkill);
        this.displayCreateDialog = false;
        this.newTechnicalSkill = {
          technical_skill: '',
          enabled: 1,
        };
      },
      error: (err) => {
        console.error('Error creating technical skill:', err);
        this.error = 'Failed to create technical skill';
      },
    });
  }
}
