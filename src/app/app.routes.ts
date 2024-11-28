import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { authGuard } from './shared/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { UserListComponent } from './features/user/user-list/user-list.component';
import { GroupAttitudeSkillComponent } from './features/group-attitude-skill/group-attitude-skill.component';
import { GroupAchievementComponent } from './features/group-achievement/group-achievement.component';
import { AchievementComponent } from './features/achievement/achievement.component';
import { AttitudeSkillComponent } from './features/attitude-skill/attitude-skill.component';
import { DivisionComponent } from './division/division.component';
import { DevPlanComponent } from './features/dev-plan/dev-plan.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, canActivate: [authGuard] },
  {
    path: 'group-attitude-skill',
    component: GroupAttitudeSkillComponent,
    canActivate: [authGuard],
  },
  {
    path: 'group-achievement',
    component: GroupAchievementComponent,
    canActivate: [authGuard],
  },
  {
    path: 'achievement',
    component: AchievementComponent,
    canActivate: [authGuard],
  },
  {
    path: 'attitude-skill',
    component: AttitudeSkillComponent,
    canActivate: [authGuard],
  },
  {
    path: 'division',
    component: DivisionComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dev-plan',
    component: DevPlanComponent,
    canActivate: [authGuard],
  },

  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'user', component: UserListComponent },
];
