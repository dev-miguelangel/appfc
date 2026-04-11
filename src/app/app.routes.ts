import { Routes } from '@angular/router';
import { publicGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/callback.component').then(m => m.AuthCallbackComponent),
  },
  {
    path: 'app',
    loadChildren: () =>
      import('./features/shell/shell.routes').then(m => m.SHELL_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
