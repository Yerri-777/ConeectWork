import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const hasRole = (expectedRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const usuario = authService.getCurrentUser();
    if (!usuario) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (usuario.rol === expectedRole) return true;

    router.navigate(['/forbidden']);
    return false;
  };
};
