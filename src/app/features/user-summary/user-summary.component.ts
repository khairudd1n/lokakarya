import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AssSummaryService } from '../../ass-summary.service';
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
import { DialogModule } from 'primeng/dialog';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../core/services/auth.service';
import { NavBarComponent } from '../nav-bar/nav-bar/nav-bar.component';
import { EmpSuggestService } from '../../emp-suggest.service';

@Component({
  selector: 'app-user-summary',
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
  templateUrl: './user-summary.component.html',
  styleUrl: './user-summary.component.css',
})
export class UserSummaryComponent implements OnInit, OnChanges {
  @Input() userId: string | null = null;
  @Input() year: number | null = null;
  @Input() isInDialog: boolean = false;

  Math = Math;

  token: string = localStorage.getItem('token') || '';
  combinedData: any[] = [];
  suggestions: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  id: string = '';
  assScore: number = 0;
  totalPercentage: number = 0;
  selectedYear: { label: string; value: number } = {
    label: '2024',
    value: 2024,
  };
  years: { label: string; value: number }[] = [];

  constructor(
    private authService: AuthService,
    private summaryService: AssSummaryService,
    private empSuggestService: EmpSuggestService
  ) {}

  onYearChange(event: any): void {
    console.log('years changed : ', this.selectedYear);
    if (this.userId) {
      this.ngOnChanges();
    } else {
      this.ngOnInit();
    }
  }

  ngOnInit(): void {
    if (!this.userId) {
      this.id = this.authService.parseJwt(this.token).sub;
    }
    this.summaryService.getAllUserAssSummary(this.id).subscribe({
      next: (data) => {
        this.years = data.content.map((item: any) => ({
          label: item.year.toString(),
          value: item.year,
        }));
        this.selectedYear = this.years[this.years.length - 1];
        this.summaryService
          .getAssSummaryDetail(this.id, this.selectedYear.value)
          .subscribe({
            next: (data) => {
              this.assScore = data.content.assess_sum.score;
              this.combinedData = [
                ...data.content.achieve_results,
                ...data.content.attitude_results,
              ];
              if (this.combinedData.length > 0) {
                this.totalPercentage = 100;
              }
              this.isLoading = false;
              console.log('data : ', this.combinedData);
              console.log('assScore : ', this.assScore);
            },
          });
      },
    });
  }

  ngOnChanges(): void {
    if (this.userId) {
      this.empSuggestService
        .getEmpSuggestByUserIdAndYear(this.userId, this.year!)
        .subscribe((data) => {
          console.log('data suggesttion : ', data);
          this.suggestions = data;
        });
      this.summaryService
        .getAssSummaryDetail(this.userId, this.year!)
        .subscribe({
          next: (data) => {
            this.assScore = data.content.assess_sum.score;
            this.combinedData = [
              ...data.content.achieve_results,
              ...data.content.attitude_results,
            ];
            if (this.combinedData.length > 0) {
              this.totalPercentage = 100;
            }
            this.isLoading = false;
            console.log('data : ', this.combinedData);
            console.log('assScore : ', this.assScore);
          },
        });
    }
  }
  isNewSection(index: number, currentSection: string): boolean {
    if (index === 0) return true;
    const previousSection = this.combinedData[index - 1].section;
    return previousSection !== currentSection;
  }
}
