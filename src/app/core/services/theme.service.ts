import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<ThemeMode>('light');
  isDarkActive = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('xplora_theme') as ThemeMode;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.setTheme(savedTheme);
      } else {
        this.setTheme('light');
      }
    }
  }

  setTheme(theme: ThemeMode) {
    this.currentTheme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('xplora_theme', theme);
      this.applyTheme(theme === 'dark');
    }
  }

  private applyTheme(isDark: boolean) {
    this.isDarkActive.set(isDark);
    if (isPlatformBrowser(this.platformId)) {
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }
}
