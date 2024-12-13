import { inject} from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const authService = inject(AuthService);
  authService.checkTokenExpiration();
  const token = localStorage.getItem('token');
  if (route.routeConfig?.path === 'login') {
   
    if (token) {
      router.navigate(['/user-profile']);
      return false;
    }
    return true; 
  }


  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true; 
};
