import { Routes } from '@angular/router';
import { authGuard, onboardingGuard } from '../../core/auth/auth.guard';

export const SHELL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'onboarding',
        canActivate: [onboardingGuard],
        loadComponent: () => import('./onboarding/onboarding.component').then(m => m.OnboardingComponent),
      },
      // ── Equipos ──
      {
        path: 'equipos',
        canActivate: [authGuard],
        loadComponent: () => import('./equipos/equipos-list.component').then(m => m.EquiposListComponent),
      },
      {
        path: 'equipos/nuevo',
        canActivate: [authGuard],
        loadComponent: () => import('./equipos/equipo-nuevo.component').then(m => m.EquipoNuevoComponent),
      },
      {
        path: 'equipos/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./equipos/equipo-detalle.component').then(m => m.EquipoDetalleComponent),
      },
      // ── Partidos ──
      {
        path: 'partidos',
        canActivate: [authGuard],
        loadComponent: () => import('./partidos/partidos-list.component').then(m => m.PartidosListComponent),
      },
      {
        path: 'partidos/nuevo',
        canActivate: [authGuard],
        loadComponent: () => import('./partidos/partido-nuevo.component').then(m => m.PartidoNuevoComponent),
      },
      {
        path: 'partidos/:id',
        canActivate: [authGuard],
        loadComponent: () => import('./partidos/partido-detalle.component').then(m => m.PartidoDetalleComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
