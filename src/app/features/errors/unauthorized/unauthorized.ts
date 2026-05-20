import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-container card card-0">
        <div class="error-icon"><svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <h2 class="error-title">Acceso Denegado</h2>
        <p class="error-desc">No tienes los permisos necesarios para acceder a esta sección. Verifica si tu sesión ha caducado o intenta ingresar con otro usuario.</p>
        <div style="display:flex;justify-content:center;gap:12px;margin-top:24px">
          <a routerLink="/login" class="btn btn-secondary">Ir al Login</a>
          <a routerLink="/" class="btn btn-primary">Volver al Inicio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page { display:flex; align-items:center; justify-content:center; min-height:100vh; background:var(--bg); padding:20px; }
    .error-container { text-align:center; padding:50px 40px; max-width:480px; width:100%; border-radius:16px; box-shadow:0 10px 40px -10px rgba(0,0,0,0.1); }
    .error-icon { color:var(--danger); margin-bottom:20px; }
    .error-title { font-size:24px; font-weight:700; color:var(--text-main); margin:0 0 12px 0; }
    .error-desc { font-size:15px; color:var(--text-muted); margin:0; line-height:1.6; }
  `]
})
export class UnauthorizedComponent {}

