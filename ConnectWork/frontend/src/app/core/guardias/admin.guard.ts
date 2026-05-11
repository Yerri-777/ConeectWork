import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
 
/**
 * ADMIN GUARD - ACTUALIZADO
 * Verifica que el usuario sea ADMIN
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
 
  console.log('[adminGuard] Verificando acceso ADMIN...');
 
  // Verificar si está logueado
  if (!authService.isLoggedIn()) {
    console.error('[adminGuard] ✗ Usuario no logueado');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
 
  // Verificar si es ADMIN
  const rol = (typeof authService.getRol === 'function'
    ? (authService.getRol() as unknown as string | undefined)
    : (authService as any).rol as string | undefined);
  console.log('[adminGuard] Rol del usuario:', rol);
 
  if (rol === 'ADMIN') {
    console.log('[adminGuard] ✓ Acceso permitido - Usuario es ADMIN');
    return true;
  }
 
  // Si no es ADMIN, redirigir a página de acceso denegado
  console.error('[adminGuard] ✗ Acceso denegado - No es ADMIN');
  router.navigate(['/forbidden']);
  return false;
};
 