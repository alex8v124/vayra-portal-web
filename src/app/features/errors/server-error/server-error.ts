import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-server-error',
  imports: [RouterLink],
  template: `
    <div class="error-page">
      <div class="error-container card card-0">
        <h1 class="error-code">500</h1>
        <h2 class="error-title">Error del Servidor</h2>
        <p class="error-desc">Ha ocurrido un problema de comunicación con el backend. Por favor, asegúrate de que el servidor esté activo e inténtalo de nuevo más tarde.</p>
        <a routerLink="/" class="btn btn-primary" style="display:inline-flex;margin-top:24px">Volver al Inicio</a>
      </div>
    </div>
  `,
  styles: [`
    .error-page { display:flex; align-items:center; justify-content:center; min-height:100vh; background:var(--bg); padding:20px; }
    .error-container { text-align:center; padding:60px 40px; max-width:480px; width:100%; border-radius:16px; box-shadow:0 10px 40px -10px rgba(0,0,0,0.1); }
    .error-code { font-size:96px; font-weight:800; color:var(--warning); line-height:1; margin:0 0 16px 0; }
    .error-title { font-size:24px; font-weight:700; color:var(--text-main); margin:0 0 12px 0; }
    .error-desc { font-size:15px; color:var(--text-muted); margin:0; line-height:1.6; }
  `]
})
export class ServerErrorComponent {}

