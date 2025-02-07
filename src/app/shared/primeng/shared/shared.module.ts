import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DropdownModule } from 'primeng/dropdown';
import { NavBarComponent } from '../../../features/nav-bar/nav-bar/nav-bar.component';

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
    DropdownModule,
    NavBarComponent,
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
    DropdownModule,
    NavBarComponent,
  ],
})
export class SharedModule {}
