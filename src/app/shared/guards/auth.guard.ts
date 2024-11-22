import { inject} from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (route.routeConfig?.path === 'login') {
    // If trying to access login and token exists, redirect to home
    if (token) {
      router.navigate(['/']);
      return false;
    }
    return true; // Allow access to login if no token
  }

  // For other routes, protect them if no token exists
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true; // Allow access to other routes if token exists
};
