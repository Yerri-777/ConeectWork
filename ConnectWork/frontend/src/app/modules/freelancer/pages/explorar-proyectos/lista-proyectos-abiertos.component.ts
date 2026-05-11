import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  RouterModule
} from '@angular/router';

import {
  ProyectoService
} from '../../../../core/services/proyecto.service';

import {
  CategoriaService
} from '../../../../core/services/categoria.service';

@Component({
  selector: 'app-lista-proyectos-abiertos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './lista-proyectos-abiertos.component.html',
  styleUrls: ['./proyectos-abiertos.component.css']
})
export class ListaProyectosAbiertosComponent implements OnInit {

  /**
   * ==================================
   * DATA
   * ==================================
   */
  proyectos: any[] = [];
  proyectosFiltrados: any[] = [];
  categorias: any[] = [];
  cargando = true;


  busqueda = '';
  filtroCategoria = '';
  filtroPresupuesto = '';

  constructor(
    private proyectoService: ProyectoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProyectos();
  }


  cargarProyectos(): void {
    this.cargando = true;

    this.proyectoService.listar().subscribe({
      next: (data: any) => {
        console.log('PROYECTOS RECIBIDOS API:', data);

        let proyectosApi = [];

        if (Array.isArray(data)) {
          proyectosApi = data;
        } else if (data?.proyectos) {
          proyectosApi = data.proyectos;
        }

        let proyectosLocales = [];
        try {
          const guardados = localStorage.getItem('connectwork_proyectos');
          proyectosLocales = guardados ? JSON.parse(guardados) : [];
        } catch (e) {
          console.error('Error cargando proyectos locales:', e);
        }

        // CONCATENAR: Locales primero (novedades) + API
        this.proyectos = [...proyectosLocales, ...proyectosApi];
        this.proyectosFiltrados = [...this.proyectos];
        this.cargando = false;
      },
      error: (err) => {
        console.error(' Error API, cargando :', err);


        let locales = [];
        try {
          const guardados = localStorage.getItem('connectwork_proyectos');
          locales = guardados ? JSON.parse(guardados) : [];
        } catch (e) {}

        const mocks = [
          {
            id: 1,
            titulo: 'Sistema Ecommerce Laravel',
            descripcion: 'Necesito una tienda online completa con pagos y panel administrativo.',
            estado: 'ABIERTO',
            categoria: { id: 1, nombre: 'Desarrollo Web' },
            presupuestoMin: 5000,
            presupuestoMax: 10000,
            propuestasCount: 4,
            plazo: 15,
            cliente: { nombreCompleto: 'Carlos López', calificacion: 4.8 }
          },
          {
            id: 2,
            titulo: 'Diseño UI/UX Mobile',
            descripcion: 'Busco diseñador para crear interfaz moderna para app móvil.',
            estado: 'ABIERTO',
            categoria: { id: 2, nombre: 'Diseño UI/UX' },
            presupuestoMin: 2500,
            presupuestoMax: 5000,
            propuestasCount: 7,
            plazo: 10,
            cliente: { nombreCompleto: 'Ana Pérez', calificacion: 4.9 }
          }
        ];

        this.proyectos = [...locales, ...mocks];
        this.proyectosFiltrados = [...this.proyectos];
        this.cargando = false;
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (cats: any[]) => {
        this.categorias = cats || [];
      },
      error: (err) => {
        this.categorias = [
          { id: 1, nombre: 'Desarrollo Web' },
          { id: 2, nombre: 'Diseño UI/UX' },
          { id: 3, nombre: 'Apps Móviles' }
        ];
      }
    });
  }


  emitirFiltros(): void {
    this.proyectosFiltrados = this.proyectos.filter((p: any) => {

      const texto = ((p.titulo || '') + ' ' + (p.descripcion || '')).toLowerCase();
      const cumpleBusqueda = !this.busqueda || texto.includes(this.busqueda.toLowerCase());


      const nombreCat = this.getCategoriaNombre(p).toLowerCase();
      const cumpleCategoria = !this.filtroCategoria ||
        (p.categoria?.id == this.filtroCategoria || p.categoriaId == this.filtroCategoria || nombreCat.includes(this.filtroCategoria.toLowerCase()));


      const presupuesto = Number(p.presupuestoMin || p.presupuestoMinimo || 0);
      let cumplePresupuesto = true;

      switch (this.filtroPresupuesto) {
        case '0-1000': cumplePresupuesto = presupuesto <= 1000; break;
        case '1000-5000': cumplePresupuesto = presupuesto >= 1000 && presupuesto <= 5000; break;
        case '5000-10000': cumplePresupuesto = presupuesto >= 5000 && presupuesto <= 10000; break;
        case '10000+': cumplePresupuesto = presupuesto > 10000; break;
      }

      return cumpleBusqueda && cumpleCategoria && cumplePresupuesto;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroCategoria = '';
    this.filtroPresupuesto = '';
    this.proyectosFiltrados = [...this.proyectos];
  }


  getEstadoClase(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'ABIERTO': return 'estado-abierto';
      case 'EN_PROCESO': return 'estado-proceso';
      case 'FINALIZADO': return 'estado-finalizado';
      default: return 'estado-default';
    }
  }

  getCategoriaNombre(proyecto: any): string {
    if (!proyecto) return 'Sin categoría';
    if (proyecto.categoria && typeof proyecto.categoria === 'object') {
      return proyecto.categoria.nombre || 'Sin categoría';
    }
    return proyecto.categoria || 'Sin categoría';
  }

  getPresupuesto(proyecto: any): string {
    const min = proyecto.presupuestoMin || proyecto.presupuestoMinimo || 0;
    return `GTQ ${Number(min).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  }

  getPresupuestoTexto(proyecto: any): string {
    const min = proyecto.presupuestoMin || proyecto.presupuestoMinimo || 0;
    const max = proyecto.presupuestoMax || proyecto.presupuestoMaximo || 0;
    return `Q${Number(min).toLocaleString('es-GT')} - Q${Number(max).toLocaleString('es-GT')}`;
  }

  getPropuestasCount(proyecto: any): number {

    return Number(proyecto?.propuestasCount || proyecto?.totalPropuestas || 0);
  }

  getPlazo(proyecto: any): number {
    return Number(proyecto?.plazo || proyecto?.plazoDias || 0);
  }

  getClienteNombre(proyecto: any): string {
    return proyecto?.cliente?.nombreCompleto || proyecto?.clienteNombre || 'Cliente Demo';
  }

  getClienteCalificacion(proyecto: any): number {
    return Number(proyecto?.cliente?.calificacion || 5.0);
  }
}
