import { Component, OnInit } from '@angular/core';
import {
  DivisionDto,
  DivisionService,
} from '../../core/services/division.service';
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
import Swal from 'sweetalert2';
import { NavBarComponent } from '../nav-bar/nav-bar/nav-bar.component';

@Component({
  selector: 'app-division',
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
    NavBarComponent,
  ],
  templateUrl: './division.component.html',
  styleUrl: './division.component.css',
})
export class DivisionComponent implements OnInit {
  divisions: DivisionDto[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  displayCreateDialog: boolean = false;
  displayEditDialog: boolean = false;
  displayDetailDialog: boolean = false;
  selectedDivisionDetail: any = {};
  newDivision: Partial<DivisionDto> = {
    division_name: '',
    enabled: 1,
  };
  selectedDivision: Partial<DivisionDto> = {};
  isDuplicate: boolean = false;

  constructor(private divisionService: DivisionService) {}

  ngOnInit(): void {
    this.fetchDivisions();
  }

  showDetailDialog(division: any) {
    this.selectedDivisionDetail = division;
    this.displayDetailDialog = true;
  }

  fetchDivisions(): void {
    this.divisionService.getAllDivisions().subscribe({
      next: (data) => {
        this.divisions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching divisions:', err);
        this.error = 'Failed to fetch divisions';
        this.isLoading = false;
      },
    });
  }

  showCreateDialog(): void {
    this.displayCreateDialog = true;
  }

  createDivision(): void {
    if (!this.newDivision.division_name) {
      return;
    }

    const existingDivision = this.divisions.find(
      (division) =>
        division.division_name.toLowerCase() ===
        this.newDivision.division_name?.toLowerCase()
    );
    if (existingDivision) {
      this.isDuplicate = true;
      return;
    }

    this.divisionService.createDivision(this.newDivision).subscribe({
      next: (newDivision) => {
        this.divisions.push(newDivision);
        this.displayCreateDialog = false;
        this.newDivision = {
          division_name: '',
          enabled: 1,
        };
        this.isDuplicate = false;

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Division created successfully.',
          confirmButtonText: 'OK',
        });
      },
      error: (err) => {
        console.error('Error creating division:', err);

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while creating division.',
          confirmButtonText: 'Try Again',
        });
      },
    });
  }

  editDivision(division: DivisionDto): void {
    this.selectedDivision = { ...division };
    this.displayEditDialog = true;
  }

  updateDivision(): void {
    if (
      !this.selectedDivision.id ||
      !this.selectedDivision.division_name === undefined
    ) {
      return;
    }

    this.divisionService
      .updateDivision(this.selectedDivision.id, this.selectedDivision)
      .subscribe({
        next: (updatedDivision) => {
          const index = this.divisions.findIndex(
            (item) => item.id === updatedDivision.id
          );
          if (index !== -1) {
            this.divisions[index] = updatedDivision;
          }
          this.displayEditDialog = false;

          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Division updated successfully.',
            confirmButtonText: 'OK',
          });
        },
        error: (err) => {
          console.error('Error updating division skill:', err);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while updating the division.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  deleteDivision(id: UUID): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this division?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.divisionService.deleteDivision(id).subscribe({
          next: () => {
            this.divisions = this.divisions.filter((skill) => skill.id !== id);

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The division has been deleted.',
              confirmButtonText: 'OK',
            });
            console.log(`Deleted Division with ID: ${id}`);
          },
          error: (err) => {
            console.error('Error deleting division:', err);
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong while deleting the division.',
              confirmButtonText: 'Try Again',
            });
          },
        });
      }
    });
  }
}
