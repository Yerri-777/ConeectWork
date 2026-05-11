import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[authGuard] Verificando autenticación...');

  if (authService.isLoggedIn()) {
    console.log('[authGuard] ✓ Usuario autenticado');
    return true;
  }

  // Si no está autenticado, redirigir a login
  console.error('[authGuard] ✗ Usuario no autenticado');
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
