import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="landing-header">
      <nav class="landing-nav">
        <a routerLink="/" class="landing-logo">
          <img src="logo-xplora-cn-nombre.png" alt="Xplora" height="32" style="object-fit: contain;">
        </a>
        <ul class="nav-links">
          <li>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span>Inicio</span>
              <div class="active-indicator"></div>
            </a>
          </li>
          <li>
            <a routerLink="/sobre-nosotros" routerLinkActive="active">
              <span>Sobre Nosotros</span>
              <div class="active-indicator"></div>
            </a>
          </li>
          <li>
            <a routerLink="/caracteristicas" routerLinkActive="active">
              <span>Características</span>
              <div class="active-indicator"></div>
            </a>
          </li>
          <li>
            <a routerLink="/preguntas-frecuentes" routerLinkActive="active">
              <span>Preguntas Frecuentes</span>
              <div class="active-indicator"></div>
            </a>
          </li>
        </ul>
        <div class="landing-actions">
          <a routerLink="/login" class="btn btn-login">
            <span>Iniciar Sesión</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </a>
        </div>
      </nav>
    </header>
  `,
  styleUrl: './landing-header.css'
})
export class LandingHeaderComponent {}
