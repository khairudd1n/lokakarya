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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  EmpAchieveService,
  EmpAchieveSkillDto,
} from '../../emp-achieve.service';
import { UUID } from 'crypto';
import Swal from 'sweetalert2';
import { EmpAttitudeSkillNewService } from '../../emp-attitude-skill-new.service';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface SubItem {
  id: string;
  score: number;
}

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

  statusAssessment: number = 0;
  Math = Math;
  roles: string[] = [];
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
  displayEditAchieveDialog: boolean = false;
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
  displayEditAttitudeDialog: boolean = false;
  editEmpAttitude: any = {
    id: '',
    userId: '',
    attitudeSkillId: '',
    score: 0,
    assessmentYear: 0,
    attitudeSkillName: '',
  };

  scoreOptions = [
    { label: '100 (Sangat Baik)', value: 100 },
    { label: '80 (Baik)', value: 80 },
    { label: '60 (Cukup)', value: 60 },
    { label: '40 (Kurang)', value: 40 },
    { label: '20 (Sangat Kurang)', value: 20 },
  ];

  showEditDialog(emp: any): void {
    
    if ('achievement' in emp) {
      
      this.showEditAchieveDialog(emp);
    } else {
      
      this.showEditAttitudeDialog(emp);
    }
  }

  showEditAchieveDialog(empAchieve: any): void {
    
    this.editEmpAchieve.achievement_id = empAchieve.achievement.id;
    this.editEmpAchieve.user_id = empAchieve.user.id;
    this.editEmpAchieve.notes = empAchieve.notes;
    this.editEmpAchieve.score = empAchieve.score;
    this.editEmpAchieve.assessment_year = empAchieve.assessment_year;
    this.editEmpAchieve.achievement_name =
      empAchieve.achievement.achievement_name;
    this.editEmpAchieve.id = empAchieve.id;
    this.displayEditAchieveDialog = true;
  }

  showEditAttitudeDialog(empAttitude: any): void {
    
    this.editEmpAttitude.attitudeSkillId = empAttitude.attitude_skill.id;
    this.editEmpAttitude.userId = empAttitude.user.id;
    this.editEmpAttitude.score = empAttitude.score;
    this.editEmpAttitude.assessmentYear = empAttitude.assessment_year;
    this.editEmpAttitude.id = empAttitude.id;
    this.editEmpAttitude.attitudeSkillName =
      empAttitude.attitude_skill.attitude_skill_name;
    this.displayEditAttitudeDialog = true;
  }

  updateEmpAttitude(): void {
    
    const updatedData = {
      id: this.editEmpAttitude.id,
      user_id: this.editEmpAttitude.userId,
      attitude_skill_id: this.editEmpAttitude.attitudeSkillId,
      score: this.editEmpAttitude.score,
      assessment_year: this.editEmpAttitude.assessmentYear,
    };

    this.empAttitudeService
      .updateEmpAttitudeSkill(this.editEmpAttitude.id, updatedData)
      .subscribe({
        next: (response) => {
          

          const index = this.combinedData.findIndex((item) =>
            item.items.some(
              (subItem: SubItem) => subItem.id === this.editEmpAttitude.id
            )
          );

          if (index !== -1) {
            const subItemIndex = this.combinedData[index].items.findIndex(
              (subItem: SubItem) => subItem.id === this.editEmpAttitude.id
            );
            if (subItemIndex !== -1) {
              this.combinedData[index].items[subItemIndex].score =
                this.editEmpAttitude.score;
            }
          }

          this.displayEditAttitudeDialog = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Emp Attitude updated successfully.',
            confirmButtonText: 'OK',
            customClass: {
              container: 'z-9999',
            },
          });
        },
        error: (err) => {
          console.error('Error updating Emp Attitude:', err);
          this.displayEditAttitudeDialog = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error updating Emp Attitude.',
            confirmButtonText: 'OK',
          });
        },
      });
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
      .updateEmpAchieveAndGenerateSummary(this.editEmpAchieve.id, updatedData)
      .subscribe({
        next: (response) => {
          

          const index = this.combinedData.findIndex((item) =>
            item.items.some(
              (subItem: SubItem) => subItem.id === this.editEmpAchieve.id
            )
          );

          if (index !== -1) {
            const subItemIndex = this.combinedData[index].items.findIndex(
              (subItem: SubItem) => subItem.id === this.editEmpAchieve.id
            );
            if (subItemIndex !== -1) {
              this.combinedData[index].items[subItemIndex].score =
                this.editEmpAchieve.score;
            }
          }

          this.displayEditAchieveDialog = false;
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Emp Achieve updated successfully.',
            confirmButtonText: 'OK',
            customClass: {
              container: 'z-9999',
            },
          });
        },
        error: (err) => {
          console.error('Error updating Emp Achieve:', err);
          this.displayEditAchieveDialog = false;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to update Emp Achieve. Please try again.',
            confirmButtonText: 'Try Again',
          });
        },
      });
  }

  constructor(
    private authService: AuthService,
    private summaryService: AssSummaryService,
    private empSuggestService: EmpSuggestService,
    private empAchieveService: EmpAchieveService,
    private empAttitudeService: EmpAttitudeSkillNewService
  ) {}

  onYearChange(event: any): void {
    
    if (this.userId) {
      this.ngOnChanges();
    } else {
      this.id = this.authService.parseJwt(this.token).sub;
      this.summaryService
        .getAssSummaryDetail(this.id, this.selectedYear.value)
        .subscribe({
          next: (data) => {
            this.assScore = data.content.assess_sum.score;
            this.statusAssessment = data.content.assess_sum.status;
            this.combinedData = [
              ...data.content.achieve_results,
              ...data.content.attitude_results,
            ];
            if (this.combinedData.length > 0) {
              this.totalPercentage = 100;
            }
            this.isLoading = false;
            
            
            
          },
        });
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtPayload = this.authService.parseJwt(token);
      this.roles = jwtPayload.roles!;
      
    }
    
    if (!this.isInDialog) {
      if (!this.userId) {
        
        this.id = this.authService.parseJwt(this.token).sub;
      } else {
        this.id = this.userId;
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
                this.statusAssessment = data.content.assess_sum.status;
                this.combinedData = [
                  ...data.content.achieve_results,
                  ...data.content.attitude_results,
                ];
                if (this.combinedData.length > 0) {
                  this.totalPercentage = 100;
                }
                this.isLoading = false;
                
                
                
              },
            });
        },
      });
    }
  }

  ngOnChanges(): void {
    
    if (this.userId) {
      this.empSuggestService
        .getEmpSuggestByUserIdAndYear(this.userId, this.year!)
        .subscribe((data) => {
          
          this.suggestions = data;
        });
      this.summaryService
        .getAssSummaryDetail(this.userId, this.year!)
        .subscribe({
          next: (data) => {
            this.assScore = data.content.assess_sum.score;
            this.statusAssessment = data.content.assess_sum.status;
            this.combinedData = [
              ...data.content.achieve_results,
              ...data.content.attitude_results,
            ];
            if (this.combinedData.length > 0) {
              this.totalPercentage = 100;
            }
            this.isLoading = false;
            
            
            
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

    worksheet.addRow(['ASSESSMENT SUMMARY REPORT']);
    worksheet.addRow(['Year:', this.selectedYear.label]);
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = { bold: true, size: 14 };

    worksheet.columns = [
      { header: 'Aspect', key: 'aspect', width: 100 },
      { header: 'Avg. Score', key: 'average_score', width: 20 },
      { header: 'Weight%', key: 'weight', width: 10 },
      { header: 'ASSESSMENT SUMMARY REPORT', key: 'final_score', width: 15 },
    ];

    worksheet
      .addRow(['Aspect', 'Average Score', 'Percentage', 'Final Score'])
      .eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
        cell.border = borderStyle;
      });

    worksheet.addRow([
      'Employee Name:',
      this.combinedData[0]?.items[0]?.user?.full_name || '',
      '',
      '',
    ]);

    this.combinedData.forEach((item, index) => {
      if (this.isNewSection(index, item.section)) {
        const sectionRow = worksheet.addRow([item.section, '', '', '']);
        sectionRow.font = { bold: true };
        sectionRow.getCell(1).alignment = { horizontal: 'center' };
        sectionRow.getCell(2).alignment = { horizontal: 'center' };
        sectionRow.getCell(3).alignment = { horizontal: 'center' };
        sectionRow.getCell(4).alignment = { horizontal: 'center' };
      }

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
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' },
          };
        });

      item.items.forEach((subItem: any) => {
        const aspect = `${subItem.achievement?.achievement_name || ''} ${
          subItem.attitude_skill?.attitude_skill_name || ''
        }`;
        worksheet.addRow([aspect, subItem.score, '', '']).eachCell((cell) => {
          cell.border = borderStyle;
        });
      });
    });

    worksheet
      .addRow(['Total Score:', '', '', this.assScore])
      .eachCell((cell) => {
        cell.border = borderStyle;
        cell.font = { bold: true };
      });

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
      if (this.isNewSection(index, item.section)) {
        tableRows.push([
          {
            content: item.section,
            colSpan: 4,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
        ]);
      }

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

    const fileName = `Assessment_Summary_${this.combinedData[0]?.items[0]?.user?.full_name}_${this.selectedYear.label}.pdf`;
    doc.save(fileName);
  }
}
