import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-features',
  imports: [CommonModule],
  template: `
    <section class="features-page animate-fade-in">
      <div class="section-container">
        <div class="section-header animate-slide-up">
          <span class="section-subtitle">Módulos del Sistema</span>
          <h1 class="section-title">Características Diseñadas para Operaciones Exigentes</h1>
          <p class="section-lead">
            Una suite integral que conecta la recolección masiva de datos en campo con la planificación estratégica e inteligencia de negocio.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-box card-animate" style="--delay: 0.1s;">
            <div class="feature-icon-wrapper i-blue glow-effect">
              <span>📊</span>
            </div>
            <h4>Auditorías de SKUs & Precios</h4>
            <p>
              Relevamiento instantáneo de existencias, quiebres de stock, caras frente a góndola (Share of Shelf) y monitoreo de precios propios frente a la competencia en tiempo real.
            </p>
            <div class="feature-tags">
              <span>Stock en vivo</span>
              <span>Precios & Promos</span>
            </div>
          </div>

          <div class="feature-box card-animate" style="--delay: 0.2s;">
            <div class="feature-icon-wrapper i-cyan glow-effect">
              <span>📸</span>
            </div>
            <h4>Storechecks con Evidencia Visual</h4>
            <p>
              Captura obligatoria de fotografías antes y después de la intervención en percha. Sincronización rápida a prueba de fallos de red en el mostrador.
            </p>
            <div class="feature-tags">
              <span>Fotos geolocalizadas</span>
              <span>Modo Offline</span>
            </div>
          </div>

          <div class="feature-box card-animate" style="--delay: 0.3s;">
            <div class="feature-icon-wrapper i-emerald glow-effect">
              <span>🗺️</span>
            </div>
            <h4>Cronogramas & Rutas GPS</h4>
            <p>
              Planificación automatizada de visitas para mercaderistas y supervisores con asignación de PDVs georreferenciados, tracking continuo y validación de asistencia in-situ.
            </p>
            <div class="feature-tags">
              <span>Rutas óptimas</span>
              <span>Validación GPS</span>
            </div>
          </div>

          <div class="feature-box card-animate" style="--delay: 0.4s;">
            <div class="feature-icon-wrapper i-purple glow-effect">
              <span>⚡</span>
            </div>
            <h4>Procesador Masivo de Datos</h4>
            <p>
              Motor optimizado en Spring Boot capaz de procesar e insertar miles de registros de auditoría en segundos sin bloquear las interfaces ni saturar bases de datos.
            </p>
            <div class="feature-tags">
              <span>Alta concurrencia</span>
              <span>Bulk Insert</span>
            </div>
          </div>

          <div class="feature-box card-animate" style="--delay: 0.5s;">
            <div class="feature-icon-wrapper i-amber glow-effect">
              <span>📈</span>
            </div>
            <h4>Analítica & Exportación Excel</h4>
            <p>
              Generación de hojas de cálculo dinámicas y reportes consolidados por cadena, canal, supervisor y SKU en un solo clic.
            </p>
            <div class="feature-tags">
              <span>Exportación instantánea</span>
              <span>KPIs automáticos</span>
            </div>
          </div>

          <div class="feature-box card-animate" style="--delay: 0.6s;">
            <div class="feature-icon-wrapper i-rose glow-effect">
              <span>🔒</span>
            </div>
            <h4>Roles & Seguridad Corporativa</h4>
            <p>
              Control estricto de accesos con autenticación JWT, segregación entre perfiles de alta gerencia, supervisores de zona y mercaderistas operativos en campo.
            </p>
            <div class="feature-tags">
              <span>Seguridad JWT</span>
              <span>Roles jerárquicos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './landing-features.css'
})
export class LandingFeaturesComponent {}
