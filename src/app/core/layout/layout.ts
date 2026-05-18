import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);

  NAV_ITEMS = [
    {id:"dashboard",label:"Dashboard",roles:["admin","analista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'},
    {id:"pdv",label:"Puntos de Venta",roles:["admin","analista","mercaderista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'},
    {id:"storecheck",label:"Storecheck",roles:["admin","analista","mercaderista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'},
    {id:"skus",label:"Catálogo SKUs",roles:["admin","analista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>'},
    {id:"actividades",label:"Actividades",roles:["admin","analista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'},
    {id:"reportes",label:"Reportes",roles:["admin","analista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'},
    {id:"validaciones",label:"Validaciones",roles:["admin","analista"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'},
    {id:"usuarios",label:"Usuarios",roles:["admin"],icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},
  ];

  visibleNavItems = computed(() => {
    const role = this.auth.currentUser()?.role || '';
    return this.NAV_ITEMS.filter(n => n.roles.includes(role));
  });

  ROLE_LABELS: Record<string, string> = {admin:"Administrador",analista:"Analista",mercaderista:"Mercaderista"};
  ROLE_COLORS: Record<string, string> = {admin:"#8B5CF6",analista:"#0EA5E9",mercaderista:"#10B981"};


  constructor(public auth: AuthService, public themeService: ThemeService) {}

  cycleTheme() {
    const current = this.themeService.currentTheme();
    if (current === 'light') this.themeService.setTheme('dark');
    else this.themeService.setTheme('light');
  }

  toggleSidebar() {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  doLogout() {
    this.auth.logout();
  }

  avatarInitials(n: string) {
    if (!n) return "U";
    return n.split(" ").map(w=>w[0]).slice(0,2).join("");
  }
}
