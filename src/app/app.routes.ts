import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { authGuard } from './shared/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { GroupAttitudeSkillComponent } from './group-attitude-skill/group-attitude-skill.component';
import { GroupAchievementComponent } from './group-achievement/group-achievement.component';
import { AchievementComponent } from './achievement/achievement.component';
import { TechnicalSkillComponent } from './technical-skill/technical-skill.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'group-attitude-skill',
    component: GroupAttitudeSkillComponent,
  },
  {
    path: 'group-achievement',
    component: GroupAchievementComponent,
  },
  {
    path: 'achievement',
    component: AchievementComponent,
  },
  {
    path: 'technical-skill',
    component: TechnicalSkillComponent,
  },
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
];
