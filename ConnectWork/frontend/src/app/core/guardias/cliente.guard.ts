import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getCurrentUser();

  if (usuario && usuario.rol === 'CLIENTE') {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
