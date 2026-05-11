import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const perfilIncompletoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[perfilIncompletoGuard] Verificando si perfil está incompleto...');

  const usuario = authService.getCurrentUser();

  // Si no hay usuario, permitir (se va a redirigir en otro lado)
  if (!usuario) {
    return true;
  }

  // Si el perfil está incompleto, redirigir a completarlo
  if (!usuario.perfilCompleto) {
    console.warn('[perfilIncompletoGuard]  Perfil incompleto - Redirigiendo');
    const rol = usuario.rol?.toLowerCase() || 'dashboard';
    router.navigate([`/${rol}/perfil-inicial`]);
    return false;
  }

  // Si el perfil está completo, permitir acceso
  console.log('[perfilIncompletoGuard] ✓ Perfil completo');
  return true;
};
