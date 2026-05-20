import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  
  let modifiedReq = req;
  
  if (isPlatformBrowser(platformId)) {
    const userStr = localStorage.getItem('tm_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          modifiedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${user.token}`)
          });
        }
      } catch (e) {}
    }
  }
  
  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!req.url.includes('/api/auth/login')) {
        if (error.status === 401 || error.status === 403) {
          router.navigate(['/unauthorized']);
        } else if (error.status >= 500 || error.status === 0) {
          router.navigate(['/error']);
        }
      }
      return throwError(() => error);
    })
  );
};
