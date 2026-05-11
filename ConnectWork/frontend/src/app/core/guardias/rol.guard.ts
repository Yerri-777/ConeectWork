import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const hasRole = (expectedRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('[hasRoleGuard] Verificando rol:', expectedRole);

    // Verificar autenticación
    if (!authService.isLoggedIn()) {
      console.error('[hasRoleGuard]  Usuario no autenticado');
      router.navigate(['/auth/login']);
      return false;
    }

    const usuario = authService.getCurrentUser();

    // Si no hay usuario, denegar acceso
    if (!usuario) {
      console.error('[hasRoleGuard]  No hay usuario');
      router.navigate(['/forbidden']);
      return false;
    }

    // Verificar si tiene el rol esperado
    if (usuario.rol === expectedRole) {
      console.log('[hasRoleGuard] Rol correcto:', expectedRole);
      return true;
    }

    // Denegar acceso si el rol no coincide
    console.error('[hasRoleGuard] ✗ Rol incorrecto. Esperado:', expectedRole, 'Actual:', usuario.rol);
    router.navigate(['/forbidden']);
    return false;
  };
};
