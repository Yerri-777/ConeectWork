import { Routes } from '@angular/router';

export const FREELANCER_ROUTES: Routes = [
  {
    path: '',
    children: [
      // Perfil inicial
      {
        path: 'perfil-inicial',
        loadComponent: () => import('./pages/perfil-inicial/perfil-freelancer.component').then(m => m.PerfilFreelancerComponent)
      },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-freelancer.component').then(m => m.DashboardFreelancerComponent)
      },

      // Explorar proyectos
      {
        path: 'explorar',
        loadComponent: () => import('./pages/explorar-proyectos/lista-proyectos-abiertos.component').then(m => m.ListaProyectosAbiertosComponent)
      },
      {
        path: 'explorar/:id',
        loadComponent: () => import('./pages/explorar-proyectos/detalle-proyecto-abierto.component').then(m => m.DetalleProyectoAbiertoComponent)
      },

      // Propuestas
      {
        path: 'propuestas',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/propuestas/mis-propuestas.component').then(m => m.MisPropuestasComponent)
          },

          {
            path: 'crear',
            redirectTo: '/freelancer/explorar',
            pathMatch: 'full'
          },

          {
            path: 'crear/:proyectoId',
            loadComponent: () => import('./pages/propuestas/crear-propuesta.component').then(m => m.CrearPropuestaComponent)
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./pages/propuestas/editar-propuesta.component').then(m => m.EditarPropuestaComponent)
          }
        ]
      },

      // Contratos
      {
        path: 'contratos',
        loadComponent: () => import('./pages/contratos/lista-contratos.component').then(m => m.ListaContratosFreelancerComponent)
      },
      {
        path: 'contratos/:id',
        loadComponent: () => import('./pages/contratos/detalle-contrato.component').then(m => m.DetalleContratoComponent)
      },

      // Entregas
      {
        path: 'entregas/subir/:id',
        loadComponent: () => import('./pages/entregas/subir-entrega.component').then(m => m.SubirEntregaComponent)
      },
      {
        path: 'entregas/historial',
        loadComponent: () => import('./pages/entregas/historial-entregas.component').then(m => m.HistorialEntregasComponent)
      },

      // Saldo
      {
        path: 'saldo',
        loadComponent: () => import('./pages/saldo/saldo-freelancer.component').then(m => m.SaldoFreelancerComponent)
      },

      // Solicitudes
      {
        path: 'solicitudes/habilidades',
        loadComponent: () => import('./pages/solicitudes/solicitar-habilidad.component').then(m => m.SolicitarHabilidadComponent)
      },

      // Reportes
      {
        path: 'reportes',
        loadComponent: () => import('./pages/reportes/reporte-freelancer.component').then(m => m.ReporteFreelancerComponent)
      },

      // Ruta por defecto
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
