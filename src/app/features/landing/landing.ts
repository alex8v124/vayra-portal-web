import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LandingHeaderComponent } from './components/landing-header/landing-header';
import { LandingFooterComponent } from './components/landing-footer/landing-footer';

@Component({
  selector: 'app-landing',
  imports: [RouterOutlet, CommonModule, LandingHeaderComponent, LandingFooterComponent],
  template: `
    <div class="landing-page-shell">
      <app-landing-header></app-landing-header>
      <main class="landing-main-content">
        <router-outlet></router-outlet>
      </main>
      <app-landing-footer></app-landing-footer>
    </div>
  `,
  styleUrl: './landing.css'
})
export class LandingComponent {}
