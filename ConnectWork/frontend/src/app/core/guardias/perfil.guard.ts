import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const perfilGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getCurrentUser();

  if (usuario && usuario.perfilCompleto) {
    return true;
  }

  const rol = usuario?.rol?.toLowerCase() || 'dashboard';
  router.navigate([`/${rol}/perfil-inicial`]);
  return false;
};
