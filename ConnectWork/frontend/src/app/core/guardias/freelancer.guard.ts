import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const freelancerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
 
  console.log('[freelancerGuard] Verificando acceso FREELANCER...');
 
  // Verificar si está logueado
  if (!authService.isLoggedIn()) {
    console.error('[freelancerGuard] ✗ Usuario no logueado');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
 
  // Verificar si es FREELANCER
  const rol = authService.getRol() as unknown as string;
  console.log('[freelancerGuard] Rol del usuario:', rol);
 
  if (rol === 'FREELANCER') {
    console.log('[freelancerGuard] ✓ Acceso permitido - Usuario es FREELANCER');
    return true;
  }
 
  // Si no es FREELANCER, redirigir a página de acceso denegado
  console.error('[freelancerGuard] ✗ Acceso denegado - No es FREELANCER');
  router.navigate(['/forbidden']);
  return false;
};
 