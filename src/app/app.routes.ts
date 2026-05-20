import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { LayoutComponent } from './core/layout/layout';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing').then(m => m.LandingComponent), pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'pdv', loadComponent: () => import('./features/pdv/pdv').then(m => m.PdvComponent) },
      { path: 'storecheck', loadComponent: () => import('./features/storecheck/storecheck').then(m => m.StorecheckComponent) },
      { path: 'skus', loadComponent: () => import('./features/skus/skus').then(m => m.SkusComponent) },
      { path: 'actividades', loadComponent: () => import('./features/actividades/actividades').then(m => m.ActividadesComponent) },
      { path: 'reportes', loadComponent: () => import('./features/reportes/reportes').then(m => m.ReportesComponent) },
      { path: 'validaciones', loadComponent: () => import('./features/validaciones/validaciones').then(m => m.ValidacionesComponent) },
      { path: 'usuarios', loadComponent: () => import('./features/usuarios/usuarios').then(m => m.UsuariosComponent) },
      { path: 'planning', loadComponent: () => import('./features/planning/planning').then(m => m.PlanningComponent) },
      { path: 'equipos', loadComponent: () => import('./features/equipos/equipos').then(m => m.EquiposComercialesComponent) },
      { path: 'perfil', loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent) }
    ]
  },
  { path: 'unauthorized', loadComponent: () => import('./features/errors/unauthorized/unauthorized').then(m => m.UnauthorizedComponent) },
  { path: 'error', loadComponent: () => import('./features/errors/server-error/server-error').then(m => m.ServerErrorComponent) },
  { path: '**', loadComponent: () => import('./features/errors/not-found/not-found').then(m => m.NotFoundComponent) }
];
