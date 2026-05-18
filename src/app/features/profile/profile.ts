import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [TitleCasePipe],
  template: `
    <div class="page-header" style="margin-bottom: 24px;">
      <h2 style="font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0;">Mi Perfil</h2>
      <p style="color: var(--text-muted); margin: 4px 0 0 0;">Gestión de cuenta y preferencias</p>
    </div>

    @if(auth.currentUser(); as user) {
      <div class="profile-card card card-0" style="max-width: 600px;">
        <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid var(--border);">
          <div class="avatar-large" [style.background]="getRoleColor(user.role) + '22'" [style.color]="getRoleColor(user.role)">
            {{ getInitials(user.name) }}
          </div>
          <div>
            <h3 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin: 0 0 4px 0;">{{ user.name }}</h3>
            <p style="color: var(--text-muted); margin: 0; font-size: 14px;">{{ user.email }}</p>
            <span class="role-badge" [style.background]="getRoleColor(user.role) + '22'" [style.color]="getRoleColor(user.role)">
              {{ user.role | titlecase }}
            </span>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-group">
            <label>Nombres Completos</label>
            <p>{{ user.name }}</p>
          </div>
          <div class="detail-group">
            <label>Correo Electrónico</label>
            <p>{{ user.email }}</p>
          </div>
          <div class="detail-group">
            <label>Rol Asignado</label>
            <p>{{ user.role | titlecase }}</p>
          </div>
          <div class="detail-group">
            <label>Estado de Cuenta</label>
            <p><span style="color:var(--success); font-weight:600">Activo</span></p>
          </div>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border);">
          <button class="btn btn-secondary" (click)="auth.logout()" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.2);">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-card { padding: 32px; }
    .avatar-large { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .role-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .profile-details { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .detail-group label { display: block; font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-group p { margin: 0; font-size: 15px; color: var(--text-main); font-weight: 500; }
    
    @media (max-width: 640px) {
      .profile-details { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent {
  auth = inject(AuthService);

  getInitials(name: string) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
  }

  getRoleColor(role: string) {
    const colors: Record<string, string> = { admin: '#8B5CF6', analista: '#0EA5E9', mercaderista: '#10B981' };
    return colors[role] || '#64748b';
  }
}

