import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GroupAchievementComponent } from './group-achievement/group-achievement.component';
import { AchievementComponent } from './achievement/achievement.component';
import { SharedModule } from './shared/primeng/shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GroupAchievementComponent, AchievementComponent, SharedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'lokakarya';
}
