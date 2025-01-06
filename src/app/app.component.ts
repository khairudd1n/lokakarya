import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/primeng/shared/shared.module';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule, MenubarModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
