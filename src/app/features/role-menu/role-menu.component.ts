import { Component, OnInit } from '@angular/core';
import { RoleMenuService } from '../../core/services/role-menu.service';
import { MenuService } from '../../core/services/menu.service';
import { RoleService } from '../../core/services/role.service';
import { SharedModule } from '../../shared/primeng/shared/shared.module';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Menu } from '../../core/models/menu.model';

@Component({
  selector: 'app-role-menu',
  standalone: true,
  imports: [SharedModule, CheckboxModule, FormsModule, CommonModule],
  templateUrl: './role-menu.component.html',
  styleUrl: './role-menu.component.css'
})
export class RoleMenuComponent implements OnInit {

  roles: any[] = [];
  menus: any[] = [];
  currentRoleMenus: any[] = [];
  roleMenus: any[] = [];
  isLoading: boolean = false;

  checkboxStates: { [roleId: string]: { [menuId: string]: boolean } } = {};

  constructor(private roleMenuService: RoleMenuService, 
    private menuService: MenuService, 
    private roleService: RoleService) {}


    ngOnInit(): void {
      this.isLoading = true;
      // Fetch all data in parallel
      forkJoin({
        menus: this.menuService.getAllMenu(),
        roles: this.roleService.getAllRole(),
        roleMenus: this.roleMenuService.getAllRoleMenuByRole()
      }).subscribe(({ menus, roles, roleMenus }) => {
        // Assign fetched data to variables
        this.menus = menus;
        this.roles = roles;
        this.roleMenus = roleMenus;

        this.currentRoleMenus = JSON.parse(JSON.stringify(roleMenus));

        // Initialize checkbox states
        this.initializeCheckboxStates();

        this.isLoading = false;
      });
    }
    
    initializeCheckboxStates(): void {
      this.roleMenus.forEach((roleMenu) => {
        // Initialize the role in checkboxStates
        this.checkboxStates[roleMenu.role.id] = {};
    
        this.menus.forEach((menu) => {
          // Check if the menu exists in roleMenu.menu
          const isSelected = roleMenu.menu.some((m: any) => m.id === menu.id);
    
          // Initialize the checkbox state
          this.checkboxStates[roleMenu.role.id][menu.id] = isSelected;
        });
      });
    
      console.log('Checkbox States:', this.checkboxStates);
    }

  isMenuSelected(roleMenu: any, menu: any): boolean {
    // Check if a menu is associated with the role
    return roleMenu.menu.some((m: any) => m.id === menu.id);
  }

  onCheckboxChange(roleId: string, menuId: string, isChecked: boolean): void {
    // Find the currentRoleMenu based on roleId
    const currentRoleMenu = this.currentRoleMenus.find((rm) => rm.role.id === roleId);
    
    if (currentRoleMenu) {
      // Find the menu to add or remove based on menuId
      const menuToModify = this.menus.find((m) => m.id === menuId);
      
      if (isChecked && menuToModify) {
        // If the checkbox is checked, add the menu to currentRoleMenu
        if (!currentRoleMenu.menu.some((m: any) => m.id === menuId)) {
          currentRoleMenu.menu.push(menuToModify);
        }
      } else {
        // If the checkbox is unchecked, remove the menu from currentRoleMenu
        currentRoleMenu.menu = currentRoleMenu.menu.filter((m: any) => m.id !== menuId);
      }
    }
  }
  
  
  saveChanges(): void {
    console.log('Current Role Menus:', this.currentRoleMenus);
    console.log('Role Menus:', this.roleMenus);
  
    const rolesToUpdate = this.currentRoleMenus.filter((roleMenu, index) => {
      return this.areRoleMenusChanged(this.roleMenus[index].menu, roleMenu.menu);
    });
  
    if (rolesToUpdate.length > 0) {
      console.log('Roles with changes:', rolesToUpdate);
    
      // Create an array of observables for role menu update requests
      const updateObservables = rolesToUpdate.map((roleMenu) => {
        const menuIds = roleMenu.menu.map((menu: any) => menu.id);
        return this.roleMenuService.updateRoleMenu(roleMenu.role.id, menuIds);
      });
    
      // Use forkJoin to execute all requests and wait until all are completed
      forkJoin(updateObservables).subscribe(
        (responses) => {
          console.log('Role menus updated successfully:', responses);
          this.ngOnInit(); // Call ngOnInit after all updates are done
        },
        (error) => {
          console.error('Error updating role menus:', error);
        }
      );
    } else {
      console.log('No changes detected, skipping update.');
    }
  }
  
  
  areRoleMenusChanged(originalMenus: any[], updatedMenus: any[]): boolean {
    // Check for null or undefined menu arrays and handle empty arrays
    if (!originalMenus || !updatedMenus) {
      return true;
    }
  
    // Compare menu lengths (if different, return true)
    if (originalMenus.length !== updatedMenus.length) {
      return true;
    }
  
    // Compare the menu IDs (only check for differences in IDs)
    const originalMenuIds = originalMenus.map((menu: any) => menu.id).sort();
    const updatedMenuIds = updatedMenus.map((menu: any) => menu.id).sort();
  
    return originalMenuIds.join() !== updatedMenuIds.join();
  }  
}

