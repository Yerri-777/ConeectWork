import { Routes } from '@angular/router';

export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-cliente.component').then(m => m.DashboardClienteComponent)
      },

      // Perfil inicial
      {
        path: 'perfil-inicial',
        loadComponent: () => import('./pages/perfil-inicial/perfil-cliente.component').then(m => m.PerfilClienteComponent)
      },

      // Proyectos
      {
        path: 'proyectos',
        loadComponent: () => import('./pages/proyectos/lista-proyectos.component').then(m => m.ListaProyectosComponent)
      },
      {
        path: 'proyectos/crear',
        loadComponent: () => import('./pages/proyectos/crear-proyecto.component').then(m => m.CrearProyectoComponent)
      },
      {
        path: 'proyectos/editar/:id',
        loadComponent: () => import('./pages/proyectos/editar-proyecto.component').then(m => m.EditarProyectoComponent)
      },
      {
        path: 'proyectos/detalle/:id',
        loadComponent: () => import('./pages/proyectos/detalle-proyecto.component').then(m => m.DetalleProyectoComponent)
      },

      // Propuestas
      {
        path: 'propuestas',
        loadComponent: () => import('./pages/propuestas/lista-propuestas-recibidas.component').then(m => m.ListaPropuestasRecibidasComponent)
      },
      {
        path: 'propuestas/detalle/:id',
        loadComponent: () => import('./pages/propuestas/detalle-propuesta.component').then(m => m.DetallePropuestaComponent)
      },

      // Contratos
      {
        path: 'contratos',
        loadComponent: () => import('./pages/contratos/lista-contratos.component').then(m => m.ListaContratosComponent)
      },
      {
        path: 'contratos/detalle/:id',
        loadComponent: () => import('./pages/contratos/detalle-contrato.component').then(m => m.DetalleContratoComponent)
      },

      // Entregas
      {
        path: 'entregas/aprobar/:id',
        loadComponent: () => import('./pages/entregas/aprobar-entrega.component').then(m => m.AprobarEntregaComponent)
      },
      {
        path: 'entregas/rechazar/:id',
        loadComponent: () => import('./pages/entregas/rechazar-entrega.component').then(m => m.RechazarEntregaComponent)
      },
      {
        path: 'entregas/calificar/:id',
        loadComponent: () => import('./pages/entregas/calificar-freelancer.component').then(m => m.CalificarFreelancerComponent)
      },

      // Saldo
      {
        path: 'saldo',
        loadComponent: () => import('./pages/saldo/saldo-cliente.component').then(m => m.SaldoClienteComponent)
      },
      {
        path: 'saldo/recargar',
        loadComponent: () => import('./pages/saldo/recargar-saldo.component').then(m => m.RecargarSaldoComponent)
      },

      // Solicitudes
      {
        path: 'solicitudes/categoria',
        loadComponent: () => import('./pages/solicitudes/solicitar-categoria.component').then(m => m.SolicitarCategoriaComponent)
      },

      // Reportes
      {
        path: 'reportes',
        loadComponent: () => import('./pages/reportes/reporte-cliente.component').then(m => m.ReporteClienteComponent)
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
