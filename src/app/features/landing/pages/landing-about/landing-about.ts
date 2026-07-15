import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-about',
  imports: [CommonModule],
  template: `
    <section class="about-page animate-fade-in">
      <div class="section-container">
        <div class="section-header animate-slide-up">
          <span class="section-subtitle">Sobre Nosotros & Nuestra Esencia</span>
          <h1 class="section-title">Transformando la Visibilidad en el Punto de Venta</h1>
          <p class="section-lead">
            En Xplora nacimos con la convicción de que el Trade Marketing no debe depender de reportes en papel ni suposiciones ciegas. Desarrollamos inteligencia de campo comprobable, rápida y precisa.
          </p>
        </div>

        <div class="about-cards-grid">
          <div class="about-card card-animate" style="--delay: 0.1s;">
            <div class="card-icon gradient-bg-1 glow-icon">🚀</div>
            <h3>Nuestra Misión</h3>
            <p>
              Empoderar a las marcas y agencias de Trade Marketing proporcionando datos verificables, trazabilidad GPS sin margen de error y herramientas masivas de auditoría para tomar decisiones instantáneas.
            </p>
            <div class="card-footer-tag">Visibilidad 360°</div>
          </div>

          <div class="about-card card-animate" style="--delay: 0.25s;">
            <div class="card-icon gradient-bg-2 glow-icon">👁️</div>
            <h3>Nuestra Visión</h3>
            <p>
              Ser la plataforma tecnológica referente en toda Latinoamérica para el control de inventarios, storechecks fotográficos inteligentes y gestión automatizada de fuerzas de ventas en campo.
            </p>
            <div class="card-footer-tag">Innovación y Liderazgo</div>
          </div>

          <div class="about-card card-animate" style="--delay: 0.4s;">
            <div class="card-icon gradient-bg-3 glow-icon">💡</div>
            <h3>Nuestros Valores</h3>
            <p>
              Transparencia absoluta en datos, agilidad en ejecución masiva, autonomía del mercaderista y excelencia continua en reportes exportables para alta gerencia.
            </p>
            <div class="card-footer-tag">Confiabilidad Total</div>
          </div>
        </div>

        <!-- Innovación y Trayectoria -->
        <div class="about-stats-banner animate-slide-up" style="--delay: 0.55s;">
          <div class="banner-content">
            <h2>Tecnología diseñada por expertos en retail</h2>
            <p>Conectamos directamente a los supervisores con lo que realmente sucede en el mostrador, eliminando intermediarios y optimizando cada segundo en ruta.</p>
          </div>
          <div class="banner-metrics">
            <div class="metric-box">
              <span class="m-num">+15M</span>
              <span class="m-txt">Fotografías Auditoría</span>
            </div>
            <div class="metric-box">
              <span class="m-num">99.9%</span>
              <span class="m-txt">Uptime del Servidor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './landing-about.css'
})
export class LandingAboutComponent {}
