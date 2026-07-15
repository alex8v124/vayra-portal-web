import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { DataService } from './data.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<any | null>(null);
  
  isLoggedIn = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => {
    const u = this.currentUser();
    return u && u.roles && u.roles.includes('ROLE_ADMIN');
  });
  isAnalista = computed(() => {
    const u = this.currentUser();
    return u && u.roles && (u.roles.includes('ROLE_ANALISTA') || u.roles.includes('ROLE_ADMIN'));
  });
  isSupervisor = computed(() => {
    const u = this.currentUser();
    return u && u.roles && (u.roles.includes('ROLE_SUPERVISOR') || u.roles.includes('ROLE_ADMIN'));
  });

  private apiUrl = `${environment.apiUrl}/api/auth/login`;

  constructor(
    private router: Router, 
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('tm_user');
      if (saved) {
        this.currentUser.set(JSON.parse(saved));
      }
    }
  }

  login(username: string, pass: string): boolean {
    // Return true optimistically, handle async later
    this.http.post<any>(this.apiUrl, { username, password: pass }).pipe(
      catchError(err => {
        console.error('Login failed', err);
        return of(null);
      })
    ).subscribe(res => {
      if (res && res.token) {
        this.currentUser.set(res);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('tm_user', JSON.stringify(res));
        }
        if (res.role === 'mercaderista') {
          this.router.navigate(['/pdv']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        alert("Error de autenticación: Credenciales incorrectas o el servidor no está disponible.");
      }
    });
    return true; // The UI logic will resolve asynchronously
  }

  logout() {
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tm_user');
    }
    this.router.navigate(['/login']);
  }
}
