import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/primeng/shared/shared.module';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { TechnicalSkillComponent } from './features/technical-skill/technical-skill/technical-skill.component';
import { GroupAchievementComponent } from './features/group-achievement/group-achievement.component';
import { AchievementComponent } from './features/achievement/achievement.component';
import { GroupAttitudeSkillComponent } from './features/group-attitude-skill/group-attitude-skill.component';
import { MenuService } from './core/services/menu.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { Menu } from './core/models/menu.model';
import { MENU_MAP } from './shared/utils/menu-map';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule, MenubarModule],
  // imports: [
  //   RouterOutlet,
  //   GroupAchievementComponent,
  //   AchievementComponent,
  //   SharedModule,
  //   GroupAttitudeSkillComponent,
  //   MenubarModule,
  //   TechnicalSkillComponent
  // ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {


}
