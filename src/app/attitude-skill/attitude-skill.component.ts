import { Component, OnInit } from '@angular/core';
import {
  AttitudeWithGroupNameDto,
  AttitudeSkillService,
} from '../attitude-skill.service';
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

@Component({
  selector: 'app-attitude-skill',
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
  ],
  templateUrl: './attitude-skill.component.html',
  styleUrl: './attitude-skill.component.css',
})
export class AttitudeSkillComponent implements OnInit {
  attitudeSkills: AttitudeWithGroupNameDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  newAttitudeSkill = {
    attitude_skill_name: '',
    group_attitude_skill_id: '',
    enabled: 1,
  };

  groupAttitudeSkillOptions: { label: string; value: string }[] = [];

  constructor(private attitudeSkillService: AttitudeSkillService) {}

  ngOnInit(): void {
    this.fetchAttitudeSkills();
    this.fetchGroupAttitudeSkillOptions();
  }

  fetchAttitudeSkills(): void {
    this.attitudeSkillService.getAllAttitudesWithGroupNames().subscribe({
      next: (data) => {
        this.attitudeSkills = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching achievements:', err);
        this.error = 'Failed to fetch achievements';
        this.isLoading = false;
      },
    });
  }

  // Show the create dialog
  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  createAttitudeSkill(): void {
    if (
      this.newAttitudeSkill.attitude_skill_name &&
      this.newAttitudeSkill.group_attitude_skill_id // Use the correct property name here
    ) {
      const attitudeSkillData = {
        attitude_skill_name: this.newAttitudeSkill.attitude_skill_name,
        group_attitude_skill_id: this.newAttitudeSkill
          .group_attitude_skill_id as UUID, // Ensure it's a valid UUID
        enabled: this.newAttitudeSkill.enabled,
      };

      // Log the payload to make sure it's correct
      console.log(
        'Sending payload for achievement creation:',
        attitudeSkillData
      );

      // Use the service to create a new achievement
      this.attitudeSkillService
        .createAttitudeSkill(attitudeSkillData)
        .subscribe({
          next: (response) => {
            console.log('Attitude Skill created successfully:', response);
            this.fetchAttitudeSkills(); // Refresh the data table
            this.newAttitudeSkill = {
              attitude_skill_name: '',
              group_attitude_skill_id: '', // Reset correctly
              enabled: 1,
            };
          },
          error: (err) => {
            console.error('Error creating achievement:', err);
            // Log the backend's response if available
            if (err.error && err.error.message) {
              console.error('Backend error message:', err.error.message);
            }
          },
        });
    } else {
      console.warn('Please fill in all fields.');
    }
  }

  clear(table: Table) {
    table.clear();
  }

  fetchGroupAttitudeSkillOptions(): void {
    this.attitudeSkillService.getGroupAttitudeSkills().subscribe({
      next: (data) => {
        // Now the data is in the correct format for the dropdown
        this.groupAttitudeSkillOptions = data;
      },
      error: (err) => {
        console.error('Error fetching group attitude options:', err);
      },
    });
  }
}