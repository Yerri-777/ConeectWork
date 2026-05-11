import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[clienteGuard] Verificando acceso CLIENTE...');

  // Verificar autenticación
  if (!authService.isLoggedIn()) {
    console.error('[clienteGuard] ✗ Usuario no autenticado');

    router.navigate(['/auth/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });

    return false;
  }

  // Obtener rol CORRECTAMENTE
  const rol = authService.getRol();

  console.log('[clienteGuard] Rol detectado:', rol);

  // Verificar rol
  if (rol === 'CLIENTE') {
    console.log('[clienteGuard] ✓ Acceso permitido');
    return true;
  }

  console.error('[clienteGuard] ✗ Acceso denegado');

  router.navigate(['/403']);

  return false;
};
