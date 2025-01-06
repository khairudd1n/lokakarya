import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AttitudeWithGroupNameDto,
  AttitudeSkillService,
} from '../../core/services/attitude-skill.service';
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
import Swal from 'sweetalert2';
import { SharedModule } from '../../shared/primeng/shared/shared.module';

@Component({
  selector: 'app-attitude-skill',
  standalone: true,
  imports: [
    SharedModule,
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
  displayDetailDialog: boolean = false;
  selectedDivisionDetail: any = {};
  newAttitudeSkill = {
    attitude_skill_name: '',
    group_attitude_skill_id: '',
    enabled: 1,
  };
  displayEditDialog: boolean = false;
  editAttitudeSkill: AttitudeWithGroupNameDto = {
    id: '' as UUID,
    attitude_skill_name: '',
    group_attitude_skill_id: '' as UUID,
    group_name: '',
    enabled: 1,
  };
  currentGroup: string = '';
  groupIndex: number = 0;

  groupAttitudeSkillOptions: { label: string; value: string }[] = [];

  constructor(private attitudeSkillService: AttitudeSkillService) {}

  ngOnInit(): void {
    this.fetchAttitudeSkills();
    this.fetchGroupAttitudeSkillOptions();
  }

  resetGroupIndex(attitudeSkill: any): number {
    if (this.currentGroup !== attitudeSkill.group_name) {
      this.currentGroup = attitudeSkill.group_name;
      this.groupIndex = 1;
    } else {
      this.groupIndex++;
    }
    return this.groupIndex;
  }

  @ViewChild('dt2') dt2: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt2) {
      this.dt2.filterGlobal(input, 'contains');
    }
  }

  showDetailDialog(division: any) {
    this.selectedDivisionDetail = division;
    this.displayDetailDialog = true;
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

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  showEditDialog(attitudeSkill: AttitudeWithGroupNameDto): void {
    this.editAttitudeSkill = { ...attitudeSkill };
    this.displayEditDialog = true;
  }

  createAttitudeSkill(): void {
    if (
      this.newAttitudeSkill.attitude_skill_name &&
      this.newAttitudeSkill.group_attitude_skill_id
    ) {
      const attitudeSkillData = {
        attitude_skill_name: this.newAttitudeSkill.attitude_skill_name,
        group_attitude_skill_id: this.newAttitudeSkill
          .group_attitude_skill_id as UUID,
        enabled: this.newAttitudeSkill.enabled,
      };

      console.log(
        'Sending payload for achievement creation:',
        attitudeSkillData
      );

      this.attitudeSkillService
        .createAttitudeSkill(attitudeSkillData)
        .subscribe({
          next: (response) => {
            console.log('Attitude Skill created successfully:', response);
            this.fetchAttitudeSkills();
            this.displayCreateDialog = false;
            this.newAttitudeSkill = {
              attitude_skill_name: '',
              group_attitude_skill_id: '',
              enabled: 1,
            };

            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Attitude Skill created successfully!',
            });
          },
          error: (err) => {
            console.error('Error creating achievement:', err);
            if (err.error && err.error.message) {
              console.error('Backend error message:', err.error.message);
            }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to create Attitude Skill. Please try again.',
            });
          },
        });
    } else {
      console.warn('Please fill in all fields.');

      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Data',
        text: 'Please fill in all fields before submitting.',
      });
    }
  }

  updateAttitudeSkill(): void {
    const updatedData = {
      attitude_skill_name: this.editAttitudeSkill.attitude_skill_name,
      group_attitude_skill_id: this.editAttitudeSkill
        .group_attitude_skill_id as UUID,
      enabled: this.editAttitudeSkill.enabled,
    };

    this.attitudeSkillService
      .updateAttitudeSkill(this.editAttitudeSkill.id, updatedData)
      .subscribe({
        next: (response) => {
          console.log('Achievement updated successfully:', response);
          this.fetchAttitudeSkills();
          this.displayEditDialog = false;

          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Attitude Skill updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating achievement:', err);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while updating the attitude skill.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }

  fetchGroupAttitudeSkillOptions(): void {
    this.attitudeSkillService.getGroupAttitudeSkills().subscribe({
      next: (data) => {
        this.groupAttitudeSkillOptions = data;
      },
      error: (err) => {
        console.error('Error fetching group attitude options:', err);
      },
    });
  }

  deleteAttitudeSkill(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Attitude Skill? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.attitudeSkillService.deleteAttitudeSkill(id).subscribe({
          next: () => {
            this.fetchAttitudeSkills();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Attitude Skill has been deleted successfully.',
            });
          },
          error: (err) => {
            console.error('Error deleting achievement:', err);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete the Attitude Skill. Please try again.',
            });
          },
        });
      }
    });
  }
}
