import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/primeng/shared/shared.module';
import { MenuService } from '../../../core/services/menu.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from 'primeng/api';
import { Menu } from '../../../core/models/menu.model';
import { MENU_MAP } from '../../../shared/utils/menu-map';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [SharedModule, MenubarModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {
  goToUserProfile() {
    window.location.href = '/user-profile';
  }
  currentUser: any;
  userRole: String[] = [];
  getInitials(arg0: any) {
    return arg0.charAt(0);
  }

  constructor(
    private menuService: MenuService,
    private authService: AuthService
  ) {}
  logout() {
    localStorage.removeItem('token');
  }

  menuItems: MenuItem[] = [];
  role: string = '';
  token: string | null = null;
  jwtPayload: any;
  userId: string = '';
  userMenu: Menu[] = [];
  userMenuItems: MenuItem[] = [];

  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.currentUser = JSON.parse(localStorage.getItem('user')!);
    if (this.token) {
      this.jwtPayload = this.authService.parseJwt(this.token);
      this.userId = this.jwtPayload.sub!;
      this.role = this.jwtPayload.roles!;
    }
    this.menuService.getMenuByUserId(this.userId).subscribe((data) => {
      this.userMenu = data;
      console.log(this.userMenu);
      this.userMenuItems = this.userMenu
        .map((menu) => MENU_MAP[menu.menu_name]) // Use MENU_MAP to find matching menu item
        .filter((menu) => menu !== undefined); // Remove undefined items (if API has extra menus not in MENU_MAP)

      this.menuItems = this.groupMenus(this.userMenuItems);
      console.log(this.menuItems);
    });
  }

  groupMenus(menuItems: MenuItem[]): MenuItem[] {
    const groupedMenus: MenuItem[] = [];

    // Dynamically add the 'User' group if any "User" item exists
    const userItems = menuItems.filter((item) =>
      ['/user', '/view-user'].includes(item.routerLink!)
    );
    if (userItems.length > 0) {
      if (userItems.length > 1) {
        groupedMenus.push({ label: 'User', items: userItems });
      } else {
        groupedMenus.push(userItems[0]);
      }
    }

    const divisionItems = menuItems.filter((item) => item.label === 'Division');
    if (divisionItems.length > 0) {
      groupedMenus.push(divisionItems[0]);
    }

    const roleMenuItems = menuItems.filter(
      (item) => item.label === 'Role Menu'
    );
    if (roleMenuItems.length > 0) {
      groupedMenus.push(roleMenuItems[0]);
    }

    // Dynamically add the 'Attitude' group if any relevant "Attitude" items exist
    const attitudeItems = menuItems.filter((item) =>
      ['/attitude-skill', '/group-attitude-skill'].includes(item.routerLink!)
    );
    if (attitudeItems.length > 0) {
      groupedMenus.push({ label: 'Attitude', items: attitudeItems });
    }

    const technicalItems = menuItems.filter((item) =>
      ['/technical-skill'].includes(item.routerLink!)
    );
    if (technicalItems.length > 0) {
      groupedMenus.push(technicalItems[0]);
    }

    // Dynamically add the 'Dev Plan' group if any relevant "Dev Plan" items exist
    const devPlanItems = menuItems.filter(
      (item) => item.routerLink === '/dev-plan'
    );
    if (devPlanItems.length > 0) {
      groupedMenus.push(devPlanItems[0]);
    }

    // Dynamically add the 'Achievement' group if any relevant "Achievement" items exist
    const achievementItems = menuItems.filter((item) =>
      ['/achievement', '/group-achievement'].includes(item.routerLink!)
    );
    if (achievementItems.length > 0) {
      groupedMenus.push({ label: 'Achievement', items: achievementItems });
    }

    const assessmentItems = menuItems.filter((item) =>
      [
        '/emp-achievement',
        '/emp-attitude-skill',
        '/emp-technical-skill',
        '/emp-dev-plan',
        '/emp-suggestion',
        '/ass-summary',
        '/self-summary',
      ].includes(item.routerLink!)
    );
    
    if (assessmentItems.length > 0) {
      if (assessmentItems.some((item) => item.routerLink === '/emp-dev-plan')) {
        assessmentItems.push({
          label: 'My Development Plan',
          routerLink: '/my-emp-dev-plan',
        });
      }
      groupedMenus.push({ label: 'Assessment', items: assessmentItems });
    }
    
    return groupedMenus;
  }
}
