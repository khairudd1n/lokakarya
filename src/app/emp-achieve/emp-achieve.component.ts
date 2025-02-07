import { Component, OnInit, ViewChild } from '@angular/core';
import { EmpAchieveSkillDto, EmpAchieveService } from '../emp-achieve.service';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableRowExpandEvent } from 'primeng/table';
import { Table } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UUID } from 'crypto';
import { DialogModule } from 'primeng/dialog';
import Swal from 'sweetalert2';
import { NavBarComponent } from '../features/nav-bar/nav-bar/nav-bar.component';
import { AssSummaryService } from '../ass-summary.service';
import { UserService } from '../core/services/user.service';
import { SharedModule } from '../shared/primeng/shared/shared.module';

@Component({
  selector: 'app-emp-achieve',
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
    NavBarComponent,
    SharedModule,
  ],
  templateUrl: './emp-achieve.component.html',
  styleUrl: './emp-achieve.component.css',
})
export class EmpAchieveComponent implements OnInit {
  users: any[] = [];
  empAchieveSkill: EmpAchieveSkillDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  newEmpAchieve = {
    user_id: '',
    notes: '',
    achievement_id: '',
    score: 0,
    assessment_year: 0,
  };
  displayEditDialog: boolean = false;
  editEmpAchieve: EmpAchieveSkillDto = {
    id: '' as UUID,
    user_id: '' as UUID,
    username: '',
    notes: '',
    achievement_id: '' as UUID,
    achievement_name: '',
    score: 0,
    assessment_year: 0,
  };
  userOptions: { label: string; value: string }[] = [];
  achievementOptions: { label: string; value: string }[] = [];

  rows = 10;
  sortField = 'joinDate';
  sortOrder = 'asc';
  totalRecords = 0;

  expandedRows: { [key: string]: boolean } = {};

  constructor(
    private empAchieveService: EmpAchieveService,
    private assSummaryService: AssSummaryService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPaginatedUsers('', 0, 10, this.sortField, this.sortOrder);
    this.fetchEmpAchieve();
    this.fetchUserOptions();
    this.fetchAchievementOptions();
  }

  loadUsersLazy(event: any): void {
    const page = event.first / event.rows;
    this.rows = event.rows;
    this.sortField = event.sortField || 'joinDate';
    this.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
    this.userService
      .getPaginatedUser('', page, this.rows, this.sortField, this.sortOrder)
      .subscribe((data) => {
        this.users = data.content;

        this.totalRecords = data.page_info.totalElements;
      });
  }

  onRowExpand(event: TableRowExpandEvent): void {
    const userId: string = event.data.id;
    event.data.loading = true;
    this.expandedRows[userId] = true;

    this.empAchieveService
      .getAllEmpAchieveByUserId(userId)
      .subscribe((achievements) => {
        const user = this.users.find((user) => user.id === userId);

        if (user) {
          user.achievements = achievements;
        }
        event.data.loading = false;
      });
  }

  loadPaginatedUsers(
    searchTerm: string,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string
  ) {
    this.userService
      .getPaginatedUser(searchTerm, page, size, sortBy, sortDirection)
      .subscribe((data) => {
        this.users = data.content;

        this.totalRecords = data.page_info.totalElements;
      });
  }

  fetchEmpAchieve(): void {
    this.empAchieveService.getAllEmpAchieve().subscribe({
      next: (data) => {
        this.empAchieveSkill = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching emp achieve:', err);
        this.error = 'Failed to fetch emp achieve';
        this.isLoading = false;
      },
    });
  }

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  showEditDialog(empAchieve: any): void {
    this.editEmpAchieve.achievement_id = empAchieve.achievement.id;
    this.editEmpAchieve.user_id = empAchieve.user.id;
    this.editEmpAchieve.notes = empAchieve.notes;
    this.editEmpAchieve.score = empAchieve.score;
    this.editEmpAchieve.assessment_year = empAchieve.assessment_year;
    this.editEmpAchieve.achievement_name =
      empAchieve.achievement.achievement_name;
    this.editEmpAchieve.id = empAchieve.id;
    this.displayEditDialog = true;
  }

  @ViewChild('dt2') dt2: Table | undefined;

  onGlobalSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt2) {
      this.loadPaginatedUsers(
        input,
        0,
        this.rows,
        this.sortField,
        this.sortOrder
      );
    }
  }

  createEmpAchieve(): void {
    if (
      this.newEmpAchieve.user_id &&
      this.newEmpAchieve.notes &&
      this.newEmpAchieve.achievement_id &&
      this.newEmpAchieve.score &&
      this.newEmpAchieve.assessment_year
    ) {
      const empAchieveData = {
        user_id: this.newEmpAchieve.user_id as UUID,
        notes: this.newEmpAchieve.notes,
        achievement_id: this.newEmpAchieve.achievement_id as UUID,
        score: this.newEmpAchieve.score,
        assessment_year: this.newEmpAchieve.assessment_year,
      };

      this.empAchieveService.createEmpAchieve(empAchieveData).subscribe({
        next: (response) => {
          this.assSummaryService
            .generateAssSummary(
              this.newEmpAchieve.user_id as UUID,
              this.newEmpAchieve.assessment_year
            )
            .subscribe();
          this.fetchEmpAchieve();
          this.displayCreateDialog = false;
          this.newEmpAchieve = {
            user_id: '',
            notes: '',
            achievement_id: '',
            score: 0,
            assessment_year: 0,
          };
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Emp achieve created successfully!',
          });
        },
        error: (err) => {
          console.error('Error creating emp achieve:', err);
          if (err.error && err.error.message) {
            console.error('Backend error message:', err.error.message);
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create Emp achieve. Please try again.',
          });
        },
      });
    } else {
      console.warn('Please fill in all fields.');
    }
  }

  updateEmpAchieve(): void {
    const updatedData = {
      user_id: this.editEmpAchieve.user_id,
      notes: this.editEmpAchieve.notes,
      achievement_id: this.editEmpAchieve.achievement_id,
      score: this.editEmpAchieve.score,
      assessment_year: this.editEmpAchieve.assessment_year,
    };

    this.empAchieveService
      .updateEmpAchieve(this.editEmpAchieve.id, updatedData)
      .subscribe({
        next: (response) => {
          this.displayEditDialog = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Emp Achieve updated successfully.',
            confirmButtonText: 'OK',
          });

          const user_id = this.editEmpAchieve.user_id;
          const user = this.users.find((user) => user.id === user_id);
          if (user) {
            const event = {
              data: user,
            } as TableRowExpandEvent;

            this.onRowExpand(event);
          }
        },
        error: (err) => {
          console.error('Error updating Emp Achieve:', err);
          this.displayEditDialog = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update Emp Achieve. Please try again.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  clear(table: Table) {
    table.clear();
  }

  fetchUserOptions(): void {
    this.empAchieveService.getUsers().subscribe({
      next: (data) => {
        this.userOptions = data;
      },
      error: (err) => {
        console.error('Error fetching user options:', err);
      },
    });
  }

  fetchAchievementOptions(): void {
    this.empAchieveService.getAchievements().subscribe({
      next: (data) => {
        this.achievementOptions = data;
      },
      error: (err) => {
        console.error('Error fetching achievement options:', err);
      },
    });
  }

  onUserChange(event: any): void {}

  onAchievementChange(event: any): void {}

  deleteEmpAchieve(id: UUID, user_id: UUID, assessment_year: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Emp Achieve? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.empAchieveService.deleteEmpAchieve(id).subscribe({
          next: () => {
            this.assSummaryService
              .generateAssSummary(user_id, assessment_year)
              .subscribe();

            this.fetchEmpAchieve();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Emp Achieve has been deleted successfully.',
            });
          },
          error: (err) => {
            console.error('Error deleting emp achieve:', err);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete the Emp Achieve. Please try again.',
            });
          },
        });
      }
    });
  }
}
