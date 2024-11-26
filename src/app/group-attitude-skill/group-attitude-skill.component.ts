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
import Swal from 'sweetalert2';

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

          // Success notification
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Group Attitude Skill created successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error creating group attitude skill:', err);

          // Error notification
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while creating the group attitude skill.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  // Show the edit dialog
  editGroupAttitudeSkill(groupAttitudeSkill: GroupAttitudeSkillDto): void {
    this.selectedGroupAttitudeSkill = { ...groupAttitudeSkill };
    this.displayEditDialog = true;
  }

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

          // Success notification
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Group Attitude Skill updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating group attitude skill:', err);

          // Error notification
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while updating the group attitude skill.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  deleteGroupAttitudeSkill(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this group attitude skill?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.groupAttitudeSkillService.deleteGroupAttitudeSkill(id).subscribe({
          next: () => {
            // Remove the deleted group attitude skill from the list
            this.groupAttitudeSkills = this.groupAttitudeSkills.filter(
              (skill) => skill.id !== id
            );

            // Success notification
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The group attitude skill has been deleted.',
              confirmButtonText: 'OK',
            });
            console.log(`Deleted Group Attitude Skill with ID: ${id}`);
          },
          error: (err) => {
            // Error notification
            console.error('Error deleting group attitude skill:', err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong while deleting the group attitude skill.',
              confirmButtonText: 'Try Again',
            });
          },
        });
      }
    });
  }
}
