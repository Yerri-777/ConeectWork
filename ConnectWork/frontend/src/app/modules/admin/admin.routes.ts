import { Routes } from '@angular/router';


// Imports de Dashboard
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Imports de Usuarios
import { ListaUsuariosComponent } from './pages/usuarios/lista-usuarios.component';

// Imports de Categorías
import { ListaCategoriasComponent } from './pages/categorias/lista-categorias.component';
import { FormularioCategoriaComponent } from './pages/categorias/formulario-categoria.component';

// Imports de Habilidades
import { ListaHabilidadesComponent } from './pages/habilidades/lista-habilidades.component';
import { FormularioHabilidadComponent } from './pages/habilidades/formulario-habilidad.component';

// Imports de Solicitudes
import { ListaSolicitudesHabilidadComponent } from './pages/solicitudes/lista-solicitudes-habilidad.component';

// Imports de Comisión
import { ConfigComisionComponent } from './pages/comision/config-comision.component';

// Imports de Saldo Plataforma
import { SaldoPlataformaComponent } from './pages/saldo-plataforma/saldo-plataforma.component';

// Imports de Reportes
import { ReporteAdminComponent } from './pages/reportes/reporte-admin.component';


export const ADMIN_ROUTES: Routes = [
  // Dashboard (default)
  { path: 'dashboard', component: DashboardComponent },

  // Usuarios
  { path: 'usuarios', component: ListaUsuariosComponent },

  // Categorías
  { path: 'categorias', component: ListaCategoriasComponent },
  { path: 'categorias/crear', component: FormularioCategoriaComponent },
  { path: 'categorias/editar/:id', component: FormularioCategoriaComponent },

  // Habilidades
  { path: 'habilidades', component: ListaHabilidadesComponent },
  { path: 'habilidades/crear', component: FormularioHabilidadComponent },
  { path: 'habilidades/editar/:id', component: FormularioHabilidadComponent },

  // Solicitudes
  { path: 'solicitudes/habilidades', component: ListaSolicitudesHabilidadComponent },
  { path: 'solicitudes/categorias', component: ListaSolicitudesHabilidadComponent },

  // Comisión
  { path: 'comision', component: ConfigComisionComponent },

  // Saldo Plataforma
  { path: 'saldo', component: SaldoPlataformaComponent },

  // Reportes
  { path: 'reportes', component: ReporteAdminComponent },

  // Default redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

