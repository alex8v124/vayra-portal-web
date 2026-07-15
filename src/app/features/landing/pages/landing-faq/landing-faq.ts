import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-faq',
  imports: [CommonModule],
  template: `
    <section class="faq-page animate-fade-in">
      <div class="section-container">
        <div class="section-header animate-slide-up">
          <span class="section-subtitle">Soporte & Resolución</span>
          <h1 class="section-title">Preguntas Frecuentes de la Plataforma</h1>
          <p class="section-lead">
            Resolvemos tus dudas principales sobre la arquitectura, acceso operativo y metodologías de recolección de datos con Xplora.
          </p>
        </div>

        <div class="faq-accordion">
          <div class="faq-item card-animate" [class.active]="activeFaq === 0" (click)="toggleFaq(0)" style="--delay: 0.1s;">
            <div class="faq-question">
              <span>¿Qué es exactamente la plataforma Xplora y cómo beneficia mi operación?</span>
              <div class="faq-toggle">
                <span class="toggle-icon">{{ activeFaq === 0 ? '−' : '+' }}</span>
              </div>
            </div>
            <div class="faq-answer-wrapper" [class.open]="activeFaq === 0">
              <div class="faq-answer">
                <p>
                  Xplora es una solución tecnológica integral dividida en un portal administrativo web (Angular/Spring Boot) y una aplicación móvil operativa. Permite el control en tiempo real de inventarios, storechecks fotográficos en punto de venta, trazas GPS y exportación de métricas de trade marketing a Excel con alta concurrencia.
                </p>
              </div>
            </div>
          </div>

          <div class="faq-item card-animate" [class.active]="activeFaq === 1" (click)="toggleFaq(1)" style="--delay: 0.2s;">
            <div class="faq-question">
              <span>¿Qué roles de usuario existen en la plataforma según la estructura corporativa?</span>
              <div class="faq-toggle">
                <span class="toggle-icon">{{ activeFaq === 1 ? '−' : '+' }}</span>
              </div>
            </div>
            <div class="faq-answer-wrapper" [class.open]="activeFaq === 1">
              <div class="faq-answer">
                <p>
                  El sistema soporta jerarquías estructuradas. Operativamente, los roles principales de campo y supervisión son los <strong>Supervisores (Rol 3)</strong>, que validan rutas y controlan equipos en vivo, y los <strong>Mercaderistas (Rol 4)</strong>, que ejecutan las tareas directas de storecheck y auditorías en góndola.
                </p>
              </div>
            </div>
          </div>

          <div class="faq-item card-animate" [class.active]="activeFaq === 2" (click)="toggleFaq(2)" style="--delay: 0.3s;">
            <div class="faq-question">
              <span>¿Cómo funciona la sincronización si el mercaderista pierde cobertura o señal de internet?</span>
              <div class="faq-toggle">
                <span class="toggle-icon">{{ activeFaq === 2 ? '−' : '+' }}</span>
              </div>
            </div>
            <div class="faq-answer-wrapper" [class.open]="activeFaq === 2">
              <div class="faq-answer">
                <p>
                  Nuestra arquitectura está diseñada para soportar modo <em>offline first</em>. Las fotos, encuestas y datos del storecheck se almacenan de forma local en el dispositivo del mercaderista y se transmiten automáticamente a la base de datos de Spring Boot en cuanto se recupera la conectividad, sin pérdida de información.
                </p>
              </div>
            </div>
          </div>

          <div class="faq-item card-animate" [class.active]="activeFaq === 3" (click)="toggleFaq(3)" style="--delay: 0.4s;">
            <div class="faq-question">
              <span>¿Cómo se gestiona el volumen masivo de datos al exportar reportes de miles de PDVs?</span>
              <div class="faq-toggle">
                <span class="toggle-icon">{{ activeFaq === 3 ? '−' : '+' }}</span>
              </div>
            </div>
            <div class="faq-answer-wrapper" [class.open]="activeFaq === 3">
              <div class="faq-answer">
                <p>
                  Hemos optimizado el controlador de reportes (<code>ReportesController</code>) y los procesadores de storechecks para manejar estructuras en memoria (<em>HashMaps/DTOs paginados</em>), evitando consultas redundantes (<em>Problema N+1</em>). Esto permite generar archivos Excel con miles de filas y columnas en menos de 2 segundos.
                </p>
              </div>
            </div>
          </div>

          <div class="faq-item card-animate" [class.active]="activeFaq === 4" (click)="toggleFaq(4)" style="--delay: 0.5s;">
            <div class="faq-question">
              <span>¿Los identificadores de usuario (IDs) siguen algún orden numérico específico?</span>
              <div class="faq-toggle">
                <span class="toggle-icon">{{ activeFaq === 4 ? '−' : '+' }}</span>
              </div>
            </div>
            <div class="faq-answer-wrapper" [class.open]="activeFaq === 4">
              <div class="faq-answer">
                <p>
                  Sí, en nuestra base de datos los IDs de los usuarios y personal operativo están configurados para autoincrementarse y contarse estrictamente a partir del número 10 en adelante (<code>START WITH 10</code>), respetando la segmentación corporativa y catálogos de SKUs preexistentes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-contact-box animate-slide-up" style="--delay: 0.65s;">
          <div class="contact-icon glow-icon">💬</div>
          <div class="contact-text">
            <h4>¿Tienes otra pregunta sobre la integración o demostración técnica?</h4>
            <p>Nuestro equipo de ingeniería y soporte de Trade Marketing está listo para ayudarte al instante.</p>
          </div>
          <a href="mailto:soporte&#64;xplora-trade.com" class="btn btn-contact">Contactar Soporte</a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './landing-faq.css'
})
export class LandingFaqComponent {
  activeFaq: number | null = 0;

  toggleFaq(index: number) {
    if (this.activeFaq === index) {
      this.activeFaq = null;
    } else {
      this.activeFaq = index;
    }
  }
}
