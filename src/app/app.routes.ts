import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { authGuard } from './shared/guards/auth.guard';
import { roleMenuGuard } from './shared/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { UserListComponent } from './features/user/user-list/user-list.component';
import { GroupAttitudeSkillComponent } from './features/group-attitude-skill/group-attitude-skill.component';
import { GroupAchievementComponent } from './features/group-achievement/group-achievement.component';
import { AchievementComponent } from './features/achievement/achievement.component';
import { AttitudeSkillComponent } from './features/attitude-skill/attitude-skill.component';
import { DivisionComponent } from './features/division/division.component';
import { DevPlanComponent } from './features/dev-plan/dev-plan.component';
import { EmpAchieveComponent } from './emp-achieve/emp-achieve.component';
import { AssSummaryComponent } from './ass-summary/ass-summary.component';
import { EmpAttitudeSkillNewComponent } from './emp-attitude-skill-new/emp-attitude-skill-new.component';
import { EmpDevPlanComponent } from './emp-dev-plan/emp-dev-plan.component';
import { TechnicalSkillComponent } from './features/technical-skill/technical-skill/technical-skill.component';
import { RoleMenuComponent } from './features/role-menu/role-menu.component';


export const routes: Routes = [
  { path: '', 
    component: HomePageComponent, 
    canActivate: [authGuard, roleMenuGuard] },
  {
    path: 'group-attitude-skill',
    component: GroupAttitudeSkillComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_GROUP_ATTITUDE_SKILL' },
  },
  {
    path: 'group-achievement',
    component: GroupAchievementComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_GROUP_ACHIEVEMENT' },
  },
  {
    path: 'achievement',
    component: AchievementComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_ACHIEVEMENT' },
  },
  {
    path: 'attitude-skill',
    component: AttitudeSkillComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_ATTITUDE_SKILL' },
  },
  {
    path: 'division',
    component: DivisionComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_DIVISION' },
  },
  {
    path: 'dev-plan',
    component: DevPlanComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_DEV_PLAN' },
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authGuard],
  },
  {
    path: 'user',
    component: UserListComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_USER' },
  },
  {
    path: 'emp-achievement',
    component: EmpAchieveComponent,
    canActivate: [authGuard],
  },
  {
    path: 'ass-summary',
    component: AssSummaryComponent,
    canActivate: [authGuard],
  },
  {
    path: 'emp-attitude-skill-new',
    component: EmpAttitudeSkillNewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'emp-dev-plan',
    component: EmpDevPlanComponent,
    canActivate: [authGuard],
  },
  {
    path: 'technical-skill',
    component: TechnicalSkillComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_TECHNICAL_SKILL' },
  },
  {
    path: 'role-menu',
    component: RoleMenuComponent,
    canActivate: [authGuard, roleMenuGuard],
    data: { permission: 'ALL_APP_ROLE_MENU' },
  }
];
