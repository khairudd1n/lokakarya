import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GroupAchievementComponent } from './group-achievement/group-achievement.component';
import { AchievementComponent } from './achievement/achievement.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GroupAchievementComponent, AchievementComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'lokakarya';
}
