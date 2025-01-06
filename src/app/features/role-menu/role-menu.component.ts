import { Component, OnInit } from '@angular/core';
import { RoleMenuService } from '../../core/services/role-menu.service';
import { MenuService } from '../../core/services/menu.service';
import { RoleService } from '../../core/services/role.service';
import { SharedModule } from '../../shared/primeng/shared/shared.module';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-role-menu',
  standalone: true,
  imports: [SharedModule, CheckboxModule, FormsModule, CommonModule],
  templateUrl: './role-menu.component.html',
  styleUrl: './role-menu.component.css',
})
export class RoleMenuComponent implements OnInit {
  roles: any[] = [];
  menus: any[] = [];
  currentRoleMenus: any[] = [];
  roleMenus: any[] = [];
  isLoading: boolean = false;

  checkboxStates: { [roleId: string]: { [menuId: string]: boolean } } = {};

  constructor(
    private roleMenuService: RoleMenuService,
    private menuService: MenuService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    forkJoin({
      menus: this.menuService.getAllMenu(),
      roles: this.roleService.getAllRole(),
      roleMenus: this.roleMenuService.getAllRoleMenuByRole(),
    }).subscribe(({ menus, roles, roleMenus }) => {
      this.menus = menus;
      this.roles = roles;
      this.roleMenus = roleMenus;

      this.currentRoleMenus = JSON.parse(JSON.stringify(roleMenus));

      this.initializeCheckboxStates();

      this.isLoading = false;
    });
  }

  initializeCheckboxStates(): void {
    this.roleMenus.forEach((roleMenu) => {
      this.checkboxStates[roleMenu.role.id] = {};

      this.menus.forEach((menu) => {
        const isSelected = roleMenu.menu.some((m: any) => m.id === menu.id);

        this.checkboxStates[roleMenu.role.id][menu.id] = isSelected;
      });
    });
  }

  isMenuSelected(roleMenu: any, menu: any): boolean {
    return roleMenu.menu.some((m: any) => m.id === menu.id);
  }

  onCheckboxChange(roleId: string, menuId: string, isChecked: boolean): void {
    const currentRoleMenu = this.currentRoleMenus.find(
      (rm) => rm.role.id === roleId
    );

    if (currentRoleMenu) {
      const menuToModify = this.menus.find((m) => m.id === menuId);

      if (isChecked && menuToModify) {
        if (!currentRoleMenu.menu.some((m: any) => m.id === menuId)) {
          currentRoleMenu.menu.push(menuToModify);
        }
      } else {
        if (menuToModify.menu_name === 'ALL_APP_ROLE_MENU') {
          const isMenuAssignedToOtherRoles = this.currentRoleMenus.some(
            (rm) =>
              rm.role.id !== roleId && rm.menu.some((m: any) => m.id === menuId)
          );

          if (isMenuAssignedToOtherRoles) {
            currentRoleMenu.menu = currentRoleMenu.menu.filter(
              (m: any) => m.id !== menuId
            );
          } else {
            this.checkboxStates[roleId][menuId] = true;
            Swal.fire({
              title: 'Warning!',
              text: 'This menu is not assigned to other roles.',
              icon: 'warning',
              confirmButtonColor: '#3085d6',
            });
            return;
          }
        } else {
          currentRoleMenu.menu = currentRoleMenu.menu.filter(
            (m: any) => m.id !== menuId
          );
        }
      }
    }
  }

  saveChanges(): void {
    const rolesToUpdate = this.currentRoleMenus.filter((roleMenu, index) => {
      return this.areRoleMenusChanged(
        this.roleMenus[index].menu,
        roleMenu.menu
      );
    });

    if (rolesToUpdate.length > 0) {
      const updateObservables = rolesToUpdate.map((roleMenu) => {
        const menuIds = roleMenu.menu.map((menu: any) => menu.id);
        return this.roleMenuService.updateRoleMenu(roleMenu.role.id, menuIds);
      });

      forkJoin(updateObservables).subscribe(
        (responses) => {
          Swal.fire({
            title: 'Success!',
            text: 'Role menus updated successfully.',
            icon: 'success',
            confirmButtonColor: '#3085d6',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        },
        (error) => {
          Swal.fire({
            title: 'Error!',
            text: 'An error occurred while updating role menus.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
          });
        }
      );
    } else {
      console.log('No changes detected, skipping update.');
    }
  }

  areRoleMenusChanged(originalMenus: any[], updatedMenus: any[]): boolean {
    if (!originalMenus || !updatedMenus) {
      return true;
    }

    if (originalMenus.length !== updatedMenus.length) {
      return true;
    }

    const originalMenuIds = originalMenus.map((menu: any) => menu.id).sort();
    const updatedMenuIds = updatedMenus.map((menu: any) => menu.id).sort();

    return originalMenuIds.join() !== updatedMenuIds.join();
  }
}
