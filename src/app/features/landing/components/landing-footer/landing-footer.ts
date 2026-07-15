import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-footer',
  imports: [RouterLink, CommonModule],
  template: `
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <img src="logo-xplora-cn-nombre.png" alt="Xplora" class="footer-logo-img">
          </div>
          <p class="footer-about">
            Plataforma integral de gestión, monitoreo en tiempo real y ejecución de Trade Marketing inteligente para empresas líderes en Latinoamérica.
          </p>
          <div class="social-links">
            <a href="javascript:void(0)" class="social-icon" title="LinkedIn">in</a>
            <a href="javascript:void(0)" class="social-icon" title="Twitter/X">𝕏</a>
            <a href="javascript:void(0)" class="social-icon" title="Instagram">ig</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><a routerLink="/">Inicio</a></li>
            <li><a routerLink="/sobre-nosotros">Sobre Nosotros</a></li>
            <li><a routerLink="/caracteristicas">Características</a></li>
            <li><a routerLink="/preguntas-frecuentes">Preguntas Frecuentes</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Plataforma</h4>
          <ul>
            <li><a routerLink="/login">Portal Web Oficina</a></li>
            <li><a href="javascript:void(0)">App Móvil GPS</a></li>
            <li><a href="javascript:void(0)">Auditorías Inteligentes</a></li>
            <li><a href="javascript:void(0)">Estado del Sistema</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Soporte & Contacto</h4>
          <p class="contact-line"><strong>Email:</strong> soporte&#64;xplora-trade.com</p>
          <p class="contact-line"><strong>Teléfono:</strong> +51 (01) 700-9900</p>
          <p class="contact-line"><strong>Horario:</strong> Lun - Sáb (8:00 AM - 6:00 PM)</p>
          <p class="contact-line"><strong>Ubicación:</strong> Lima, Perú</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Xplora Trade Marketing System. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styleUrl: './landing-footer.css'
})
export class LandingFooterComponent {}
