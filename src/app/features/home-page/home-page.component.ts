import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar/nav-bar.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, NavBarComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {}
