import { Component, OnInit } from '@angular/core';
import {
  GroupAttitudeSkillDto,
  GroupAttitudeSkillService,
} from '../group-attitude-skill.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-group-attitude-skill',
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
  templateUrl: './group-attitude-skill.component.html',
  styleUrls: ['./group-attitude-skill.component.css'],
})
export class GroupAttitudeSkillComponent implements OnInit {
  groupAttitudeSkills: GroupAttitudeSkillDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  newGroupAttitudeSkill: Partial<GroupAttitudeSkillDto> = {
    group_name: '',
    percentage: 0,
    enabled: 1,
  };
  selectedGroupAttitudeSkill: Partial<GroupAttitudeSkillDto> = {};

  constructor(private groupAttitudeSkillService: GroupAttitudeSkillService) {}

  ngOnInit(): void {
    this.fetchGroupAttitudeSkills();
  }

  fetchGroupAttitudeSkills(): void {
    this.groupAttitudeSkillService.getAllGroupAttitudeSkills().subscribe({
      next: (data) => {
        this.groupAttitudeSkills = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching group attitude skills:', err);
        this.error = 'Failed to fetch group attitude skills';
        this.isLoading = false;
      },
    });
  }

  // Show the create dialog
  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  // Create a new group attitude skill
  createGroupAttitudeSkill(): void {
    if (
      !this.newGroupAttitudeSkill.group_name ||
      this.newGroupAttitudeSkill.percentage === undefined
    ) {
      return;
    }

    this.groupAttitudeSkillService
      .createGroupAttitudeSkill(this.newGroupAttitudeSkill)
      .subscribe({
        next: (newGroupAttitudeSkill) => {
          this.groupAttitudeSkills.push(newGroupAttitudeSkill);
          this.displayCreateDialog = false;
          this.newGroupAttitudeSkill = {
            group_name: '',
            percentage: 0,
            enabled: 1,
          };
        },
        error: (err) => {
          console.error('Error creating group attitude skill:', err);
        },
      });
  }

  // Show the edit dialog
  editGroupAttitudeSkill(groupAttitudeSkill: GroupAttitudeSkillDto): void {
    this.selectedGroupAttitudeSkill = { ...groupAttitudeSkill };
    this.displayEditDialog = true;
  }

  // Update an existing group attitude skill
  updateGroupAttitudeSkill(): void {
    if (
      !this.selectedGroupAttitudeSkill.id ||
      !this.selectedGroupAttitudeSkill.group_name ||
      this.selectedGroupAttitudeSkill.percentage === undefined
    ) {
      return;
    }

    this.groupAttitudeSkillService
      .updateGroupAttitudeSkill(
        this.selectedGroupAttitudeSkill.id,
        this.selectedGroupAttitudeSkill
      )
      .subscribe({
        next: (updatedGroupAttitudeSkill) => {
          const index = this.groupAttitudeSkills.findIndex(
            (item) => item.id === updatedGroupAttitudeSkill.id
          );
          if (index !== -1) {
            this.groupAttitudeSkills[index] = updatedGroupAttitudeSkill;
          }
          this.displayEditDialog = false;
        },
        error: (err) => {
          console.error('Error updating group attitude skill:', err);
        },
      });
  }

  // Delete a group attitude skill
  deleteGroupAttitudeSkill(id: UUID): void {
    if (confirm('Are you sure you want to delete this group attitude skill?')) {
      this.groupAttitudeSkillService.deleteGroupAttitudeSkill(id).subscribe({
        next: () => {
          this.groupAttitudeSkills = this.groupAttitudeSkills.filter(
            (skill) => skill.id !== id
          );
          console.log(`Deleted Group Attitude Skill with ID: ${id}`);
        },
        error: (err) => {
          console.error('Error deleting group attitude skill:', err);
          this.error = 'Failed to delete group attitude skill';
        },
      });
    }
  }
}
