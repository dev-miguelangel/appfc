import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    if (!auth.perfilCompleto()) {
      return router.createUrlTree(['/app/onboarding']);
    }
    return true;
  }
  return router.createUrlTree(['/auth']);
};

export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth']);
  }
  if (auth.perfilCompleto()) {
    return router.createUrlTree(['/app/dashboard']);
  }
  return true;
};

export const publicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/app/dashboard']);
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth']);
  }
  if (!auth.isAdmin()) {
    return router.createUrlTree(['/app/dashboard']);
  }
  return true;
};
