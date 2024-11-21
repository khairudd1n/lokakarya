import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GroupAchievementComponent } from './group-achievement/group-achievement.component';
import { UserListComponent } from './features/user/user-list/user-list.component';
import { LoginComponent } from './features/auth/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GroupAchievementComponent, UserListComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'lokakarya';
}
