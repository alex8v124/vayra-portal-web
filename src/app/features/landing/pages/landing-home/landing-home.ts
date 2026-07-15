import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-home',
  imports: [RouterLink, CommonModule],
  template: `
    <section class="hero-section animate-fade-in">
      <div class="hero-container">
        <div class="hero-text animate-slide-up">
          <div class="badge-wrapper">
            <span class="badge-tag pulse-animation">
              <span class="badge-dot"></span> Plataforma Inteligente V2.5
            </span>
          </div>
          <h1 class="hero-title">
            Revoluciona el <span class="gradient-text">Trade Marketing</span> con datos en tiempo real
          </h1>
          <p class="hero-desc">
            Monitorea puntos de venta, supervisa mercaderistas con GPS y genera cronogramas inteligentes y reportes en Excel de forma masiva y autónoma.
          </p>
          <div class="hero-buttons">
            <a routerLink="/login" class="btn btn-primary glow-effect">
              <span>Comenzar ahora</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a routerLink="/caracteristicas" class="btn btn-outline">
              <span>Explorar funciones</span>
            </a>
          </div>
          <div class="stats-row">
            <div class="stat-item hover-scale">
              <span class="stat-num">+99.8%</span>
              <span class="stat-label">Precisión en Auditorías</span>
            </div>
            <div class="stat-item hover-scale">
              <span class="stat-num">5,000+</span>
              <span class="stat-label">Puntos de Venta Activos</span>
            </div>
            <div class="stat-item hover-scale">
              <span class="stat-num">100%</span>
              <span class="stat-label">Trazabilidad GPS</span>
            </div>
          </div>
        </div>

        <div class="hero-visual animate-float">
          <div class="glass-mockup">
            <div class="mockup-header">
              <div class="mockup-dots">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <span class="mockup-title">Portal de Gestión — Xplora Live Dashboard</span>
              <div class="mockup-live">
                <span class="status-dot"></span> EN VIVO
              </div>
            </div>
            <div class="mockup-body">
              <div class="dashboard-preview">
                <div class="preview-header">
                  <div class="preview-card accent-card">
                    <span class="card-title">Cumplimiento PDV</span>
                    <span class="card-val">96.8% <small>+4.2% hoy</small></span>
                  </div>
                  <div class="preview-card">
                    <span class="card-title">Mercaderistas en Ruta</span>
                    <span class="card-val">142 <small class="text-info">Activos GPS</small></span>
                  </div>
                </div>

                <div class="preview-chart">
                  <div class="bar bar-1"></div>
                  <div class="bar bar-2"></div>
                  <div class="bar bar-3 active"></div>
                  <div class="bar bar-4"></div>
                  <div class="bar bar-5 active"></div>
                  <div class="bar bar-6"></div>
                  <div class="bar bar-7 active"></div>
                </div>

                <div class="preview-list">
                  <div class="list-item">
                    <span class="status-indicator online"></span>
                    <span class="item-text"><strong>Supervisión #104:</strong> Storecheck completado — Wong Óvalo Gutiérrez</span>
                    <span class="item-time">hace 2 min</span>
                  </div>
                  <div class="list-item">
                    <span class="status-indicator online"></span>
                    <span class="item-text"><strong>Sincronización masiva:</strong> 1,250 SKUs actualizados con éxito</span>
                    <span class="item-time">hace 5 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="glow-orb orb-1"></div>
          <div class="glow-orb orb-2"></div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './landing-home.css'
})
export class LandingHomeComponent {}
