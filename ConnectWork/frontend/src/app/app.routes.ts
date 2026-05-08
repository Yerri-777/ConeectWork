import { Routes } from '@angular/router';
import { authGuard } from './core/guardias/auth.guard';
import { adminGuard } from './core/guardias/admin.guard';
import { freelancerGuard } from './core/guardias/freelancer.guard';
import { clienteGuard } from './core/guardias/cliente.guard';
import { perfilGuard } from './core/guardias/perfil.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome.component').then(m => m.WelcomeComponent)
  },


  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },


  {
    path: 'cliente',
    canActivate: [authGuard, clienteGuard],
    loadChildren: () => import('./modules/cliente/cliente.routes').then(m => m.CLIENTE_ROUTES)
  },


  {
    path: 'freelancer',
    canActivate: [authGuard, freelancerGuard],
    loadChildren: () => import('./modules/freelancer/freelancer.routes').then(m => m.FREELANCER_ROUTES)
  },


  {
    path: '403',
    loadComponent: () => import('./pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: 'error',
    loadComponent: () => import('./pages/error/error.component').then(m => m.ErrorComponent)
  },


  {
    path: '**',
    redirectTo: '/404'
  }
];
