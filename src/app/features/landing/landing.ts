import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <div class="landing-page">
      <nav class="landing-nav">
        <div class="landing-logo">
          <img src="logo-xplora-cn-nombre.png" alt="Vayra" height="32" style="object-fit: contain;">
        </div>
        <div class="landing-actions">
          <a routerLink="/login" class="btn btn-secondary">Iniciar Sesión</a>
        </div>
      </nav>
      
      <main class="hero">
        <div class="hero-content">
          <h1 class="hero-title">El futuro del <br/><span style="color:var(--primary)">Trade Marketing</span></h1>
          <p class="hero-desc">Gestiona tus puntos de venta, monitorea inventarios en tiempo real y empodera a tu equipo de campo con la mejor herramienta del mercado.</p>
          <div class="hero-buttons">
            <a routerLink="/login" class="btn btn-primary" style="padding:16px 32px; font-size:16px">Acceder al Portal</a>
          </div>
        </div>
        <div class="hero-image">
          <div class="glass-mockup">
            <div class="mockup-header">
              <div class="mockup-dot"></div>
              <div class="mockup-dot"></div>
              <div class="mockup-dot"></div>
            </div>
            <div class="mockup-body">
              <div class="skeleton-line" style="width: 40%"></div>
              <div class="skeleton-line" style="width: 80%"></div>
              <div class="skeleton-line" style="width: 60%"></div>
              <div style="display:flex; gap:16px; margin-top:24px">
                <div class="skeleton-box"></div>
                <div class="skeleton-box"></div>
                <div class="skeleton-box"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section class="landing-section about-section" id="about">
        <div class="section-content">
          <h2 class="section-title">Sobre Nosotros</h2>
          <p class="section-desc">En Xplora, somos un equipo apasionado por transformar la manera en que se gestiona el Trade Marketing. Nuestra misión es brindar herramientas tecnológicas de vanguardia que permitan a las empresas optimizar sus procesos de campo, mejorar la visibilidad de sus productos y empoderar a sus mercaderistas.</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🚀</div>
              <h3>Innovación</h3>
              <p>Desarrollamos soluciones adaptables a las nuevas exigencias del mercado retail.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🤝</div>
              <h3>Compromiso</h3>
              <p>Tu éxito en el punto de venta es nuestro principal objetivo.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3>Resultados</h3>
              <p>Datos precisos y en tiempo real para la toma de decisiones estratégicas.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="landing-section faq-section" id="faq">
        <div class="section-content">
          <h2 class="section-title">Preguntas Frecuentes</h2>
          <div class="faq-list">
            <div class="faq-item">
              <h3>¿Qué es Xplora?</h3>
              <p>Es una plataforma integral diseñada para planificar, ejecutar y supervisar estrategias de Trade Marketing de forma eficiente, conectando a los equipos de oficina con los equipos en terreno.</p>
            </div>
            <div class="faq-item">
              <h3>¿Quiénes pueden utilizar esta plataforma?</h3>
              <p>Está dirigida principalmente a supervisores, analistas de trade marketing y mercaderistas que realizan visitas a puntos de venta para auditar productos, inventarios y campañas.</p>
            </div>
            <div class="faq-item">
              <h3>¿Cómo accedo al sistema?</h3>
              <p>Debes recibir las credenciales de acceso de parte del administrador de tu empresa. Con tu usuario y contraseña, podrás acceder desde cualquier dispositivo.</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="landing-footer">
        <p>&copy; 2026 Xplora Trade Marketing. Todos los derechos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #fff; display: flex; flex-direction: column; }
    .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 24px 48px; }
    .landing-logo { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 20px; color: #fff; }
    .landing-logo svg { color: var(--primary); }
    .landing-actions .btn { border-color: rgba(255,255,255,0.2); color: #fff; background: transparent; }
    .landing-actions .btn:hover { background: rgba(255,255,255,0.1); }
    
    .hero { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 48px; max-width: 1200px; margin: 0 auto; gap: 64px; }
    .hero-content { flex: 1; }
    .hero-title { font-size: 64px; font-weight: 800; line-height: 1.1; margin: 0 0 24px 0; letter-spacing: -1px; }
    .hero-desc { font-size: 20px; color: rgba(255,255,255,0.7); line-height: 1.6; margin: 0 0 40px 0; max-width: 500px; }
    
    .hero-image { flex: 1; display: flex; justify-content: flex-end; }
    .glass-mockup { width: 100%; max-width: 500px; background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.5); transform: rotateY(-10deg) rotateX(5deg); transition: transform 0.3s ease; }
    .glass-mockup:hover { transform: rotateY(0) rotateX(0); }
    .mockup-header { background: rgba(255,255,255,0.05); padding: 16px; display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .mockup-dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.2); }
    .mockup-dot:nth-child(1) { background: #ef4444; }
    .mockup-dot:nth-child(2) { background: #f59e0b; }
    .mockup-dot:nth-child(3) { background: #10b981; }
    .mockup-body { padding: 32px; }
    .skeleton-line { height: 16px; background: rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 16px; }
    .skeleton-box { flex: 1; height: 120px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    
    .landing-section { padding: 80px 24px; text-align: center; }
    .about-section { background: rgba(255,255,255,0.02); }
    .faq-section { background: transparent; }
    .section-content { max-width: 1000px; margin: 0 auto; }
    .section-title { font-size: 36px; font-weight: 700; margin-bottom: 24px; color: #fff; }
    .section-desc { font-size: 18px; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 48px; }
    
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; text-align: left; }
    .feature-card { background: rgba(255,255,255,0.05); padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
    .feature-icon { font-size: 40px; margin-bottom: 16px; }
    .feature-card h3 { margin: 0 0 12px 0; font-size: 20px; }
    .feature-card p { margin: 0; color: rgba(255,255,255,0.7); line-height: 1.5; }

    .faq-list { display: flex; flex-direction: column; gap: 24px; text-align: left; max-width: 800px; margin: 0 auto; }
    .faq-item { background: rgba(255,255,255,0.03); padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .faq-item h3 { margin: 0 0 12px 0; font-size: 20px; color: #fff; }
    .faq-item p { margin: 0; color: rgba(255,255,255,0.7); line-height: 1.5; }

    .landing-footer { text-align: center; padding: 32px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); margin-top: auto; }

    @media (max-width: 992px) {
      .hero { flex-direction: column; text-align: center; padding: 32px 24px; gap: 48px; }
      .hero-desc { margin: 0 auto 40px auto; }
      .hero-title { font-size: 48px; }
      .landing-nav { padding: 24px; }
    }
  `]
})
export class LandingComponent {}
