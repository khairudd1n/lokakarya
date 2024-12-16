import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { Menu } from '../../core/models/menu.model';

export const roleMenuGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const jwtPayload = authService.parseJwt(token!);
  const userId = jwtPayload.sub!;
  const menuService = inject(MenuService);
  const data = await firstValueFrom(menuService.getMenuByUserId(userId));
  let menus: Menu[] = [];
  try {
    menus = data;
  } catch (e) {
    console.error(e);
    return false;
  }
  const requiredPermission = route.data['permission'];

  const canAccess = menus.some((menu) => menu.menu_name === requiredPermission);
  if(!canAccess){
    router.navigate(['/user-profile']);
    return false;
  }
  return true;
};
