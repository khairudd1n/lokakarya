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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
    label: '2025',
    value: 2025,
  };
  years: { label: string; value: number }[] = [];
  full_name: string = '';

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

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assessment Summary');

    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as ExcelJS.BorderStyle },
      left: { style: 'thin' as ExcelJS.BorderStyle },
      bottom: { style: 'thin' as ExcelJS.BorderStyle },
      right: { style: 'thin' as ExcelJS.BorderStyle },
    };

    // Add title and year
    worksheet.addRow(['ASSESSMENT SUMMARY REPORT']);
    worksheet.addRow(['Year:', this.selectedYear.label]);
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = { bold: true, size: 14 };

    // Define columns
    worksheet.columns = [
      { header: 'Aspect', key: 'aspect', width: 40 },
      { header: 'Average Score', key: 'average_score', width: 20 },
      { header: 'Weight%', key: 'weight', width: 10 },
      { header: 'Final Score', key: 'final_score', width: 15 },
    ];

    // Add employee name
    worksheet.addRow([
      'Employee Name:',
      this.combinedData[0]?.items[0]?.user?.full_name || '',
    ]);

    // Add section and data
    this.combinedData.forEach((item, index) => {
      // Check if it's a new section
      if (this.isNewSection(index, item.section)) {
        worksheet.addRow([item.section, '', '', '']).font = { bold: true };
      }

      // Add group name row
      const finalScore = Math.round(item.total_score * (item.percentage / 100));
      worksheet
        .addRow([
          item.group_name,
          item.total_score,
          item.percentage,
          finalScore,
        ])
        .eachCell((cell) => {
          cell.border = borderStyle;
        });

      // Add achievements and attitude skills
      item.items.forEach((subItem: any) => {
        const aspect = `${subItem.achievement?.achievement_name || ''} ${
          subItem.attitude_skill?.attitude_skill_name || ''
        }`;
        const dataRow = worksheet.addRow([aspect, 'Score:', subItem.score, '']);
        dataRow.eachCell((cell) => {
          cell.border = borderStyle;
        });
      });
    });

    // Add total score row at the bottom
    const totalScoreRow = worksheet.addRow([
      'Total Score:',
      '',
      '',
      this.assScore,
    ]);
    totalScoreRow.eachCell((cell) => {
      cell.border = borderStyle;
    });

    // Save the workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileName = `Assessment_Summary_${this.combinedData[0]?.items[0]?.user?.full_name}_${this.selectedYear.label}.xlsx`;
      saveAs(blob, fileName);
    });
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const tableColumn = ['Aspect', 'Average Score', 'Weight%', 'Final Score'];
    const tableRows: any[] = [];
    let name: string = '';

    this.combinedData.forEach((item, index) => {
      item.items.forEach((subItem: any) => {
        name = subItem.user?.full_name || '';
        return;
      });
    });

    // Add full_name and assessment_year at the top
    tableRows.push([
      {
        content: `Employee Name:`,
        styles: { halign: 'left', fontStyle: 'bold' },
      },
      {
        content: `${name || ''}`,
        colSpan: 3,
        styles: { halign: 'left' },
      },
    ]);
    tableRows.push([
      {
        content: `Assessment Year:`,
        styles: { halign: 'left', fontStyle: 'bold' },
      },
      {
        content: `${this.selectedYear.label}`,
        colSpan: 3,
        styles: { halign: 'left' },
      },
    ]);

    this.combinedData.forEach((item, index) => {
      // Check if it's a new section
      if (this.isNewSection(index, item.section)) {
        tableRows.push([
          {
            content: item.section,
            colSpan: 4,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
        ]); // Add section header
      }

      // Add group name row with light gray background
      tableRows.push([
        {
          content: item.group_name,
          styles: {
            fillColor: [211, 211, 211],
            fontStyle: 'bold',
            halign: 'center',
          },
        },
        {
          content: item.total_score,
          styles: { halign: 'center' },
        },
        {
          content: item.percentage,
          styles: { halign: 'center' },
        },
        {
          content: Math.round(item.total_score * (item.percentage / 100)),
          styles: { halign: 'center' },
        },
      ]);

      // Add achievements and attitude skills
      item.items.forEach((subItem: any) => {
        tableRows.push([
          `${subItem.achievement?.achievement_name || ''}${
            subItem.attitude_skill?.attitude_skill_name || ''
          }
          `,
          'Score:',
          subItem.score,
          '',
        ]);
      });
    });

    // Add total score row at the bottom
    tableRows.push([
      {
        content: 'Total Score:',
        colSpan: 3,
        styles: { halign: 'center', fontStyle: 'bold' },
      },
      {
        content: this.assScore,
        styles: { halign: 'center' },
      },
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: {
        0: {},
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
      },
      margin: { top: 10 },
    });

    doc.save('my_summary.pdf');
  }
}
