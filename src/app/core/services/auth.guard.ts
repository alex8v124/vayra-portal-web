import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);

  // Skip guard on server-side rendering
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    const isDashboard = state.url.includes('/dashboard');
    if (isDashboard && !authService.isAnalista()) {
      if (authService.isSupervisor()) {
        return router.parseUrl('/planning');
      } else {
        return router.parseUrl('/pdv');
      }
    }
    
    const isPlanning = state.url.includes('/planning');
    const userRole = authService.currentUser()?.role;
    if (isPlanning && !authService.isSupervisor() && userRole !== 'mercaderista') {
      return router.parseUrl('/pdv');
    }
    
    const isEquipos = state.url.includes('/equipos');
    if (isEquipos && !authService.isAdmin()) {
      return router.parseUrl('/pdv');
    }
    
    return true;
  }
  
  return router.parseUrl('/login');
};
