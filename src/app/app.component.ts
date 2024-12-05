import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/primeng/shared/shared.module';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { TechnicalSkillComponent } from './features/technical-skill/technical-skill/technical-skill.component';

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
export class AppComponent implements OnInit {
  logout() {
    localStorage.removeItem('token');
  }
  items: MenuItem[] = [];
  role: string = 'EMP';

  ngOnInit() {
    // Check the user's role and load the corresponding menu
    if (this.role === 'HR') {
      this.items = this.getHrMenu();
    } else if (this.role === 'EMP') {
      this.items = this.getEmpMenu();
    }
  }
  // Define admin menu items
  getHrMenu(): MenuItem[] {
    return [
      // { label: 'User' },
      // { label: 'Division', routerLink: '/division' },
      { label: 'User', routerLink: '/user' },
      { label: 'Division', routerLink : '/division' },
      { label: 'Role-menu', routerLink: '/role-menu' },
      {
        label: 'Attitude',
        items: [
          { label: 'Group attitude', routerLink: '/group-attitude-skill' },
          { label: 'Attitude skill', routerLink: '/attitude-skill' },
        ],
      },
      { label: 'Technical skill', routerLink: '/technical-skill' },
      { label: 'Dev plan', routerLink: '/dev-plan' },
      {
        label: 'Achievement',
        items: [
          { label: 'Achievement', routerLink: '/achievement' },
          { label: 'Group achieve', routerLink: '/group-achievement' },
          { label: 'Emp achieve', routerLink: '/emp-achievement' },
        ],
      },
      {
        label: 'Assessment',
        items: [
          { label: 'Summary', routerLink: '/ass-summary' },
          { label: 'Achievement' },
          { label: 'Attitude Skill' },
        ],
      },
    ];
  }
  // Define employee menu items
  getEmpMenu(): MenuItem[] {
    return [
      {
        label: 'Assessment',
        items: [
          { label: 'Attitude Skill', routerLink: '/emp-attitude-skill-new' },
          { label: 'Dev Plan', routerLink: '/emp-dev-plan' },
          { label: 'Technical Skill', routerLink: '/emp-technical-skill' },
          { label: 'Summary' },
        ],
      },
      { label: 'my dev plan', routerLink: '/emp-dev-plan-table' },
    ];
  }
}
