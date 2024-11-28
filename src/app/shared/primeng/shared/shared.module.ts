import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ColumnFilter, TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DropdownModule } from 'primeng/dropdown';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DialogModule,
    ToggleButtonModule,
    DropdownModule
  ], 
  exports: [
    ButtonModule,
    InputTextModule,
    CardModule,
    FormsModule,
    CommonModule,
    DialogModule,
    TableModule,
    ToggleButtonModule,
    DropdownModule
  ],

})
export class SharedModule { }
