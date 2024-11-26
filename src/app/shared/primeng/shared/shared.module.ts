import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DialogModule

  ], 
  exports: [
    ButtonModule,
    InputTextModule,
    CardModule,
    FormsModule,
    CommonModule,
    DialogModule
  ],

})
export class SharedModule { }
