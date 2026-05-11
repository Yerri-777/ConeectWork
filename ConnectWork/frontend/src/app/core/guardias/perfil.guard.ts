import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const perfilGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[perfilGuard] Verificando perfil completo...');

  const usuario = authService.getCurrentUser();

  // Si no hay usuario, redirigir a login
  if (!usuario) {
    console.error('[perfilGuard] ✗ No hay usuario autenticado');
    router.navigate(['/auth/login']);
    return false;
  }

  // Si el perfil está completo, permitir acceso
  if (usuario.perfilCompleto) {
    console.log('[perfilGuard] ✓ Perfil completo - Acceso permitido');
    return true;
  }

  // Si el perfil no está completo, redirigir a completar perfil
  console.warn('[perfilGuard]  Perfil incompleto - Redirigiendo');
  const rol = usuario.rol?.toLowerCase() || 'dashboard';
  router.navigate([`/${rol}/perfil-inicial`]);
  return false;
};
