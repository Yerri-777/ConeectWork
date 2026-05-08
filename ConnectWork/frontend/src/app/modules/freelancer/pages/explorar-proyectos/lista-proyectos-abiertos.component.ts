
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProyectoService } from '../../../../core/services/proyecto.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { Proyecto } from '../../../../core/models/proyecto.model';
import { Categoria } from '../../../../core/models/categoria.model';
import { FiltrosBusquedaComponent } from './filtros-busqueda.component';

@Component({
  selector: 'app-lista-proyectos-abiertos',
  standalone: true,
  imports: [CommonModule, RouterModule, FiltrosBusquedaComponent],
  templateUrl: './lista-proyectos-abiertos.component.html',
  styleUrls: ['./proyectos-abiertos.component.css']
})
export class ListaProyectosAbiertosComponent implements OnInit {

  proyectos: Proyecto[] = [];
  proyectosFiltrados: Proyecto[] = [];
  categorias: Categoria[] = [];

  constructor(
    private proyectoService: ProyectoService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarCategorias();
  }

  private cargarProyectos(): void {
    this.proyectoService.listarAbiertos().subscribe({
      next: (proyectos: Proyecto[]) => {
        this.proyectos = proyectos;
        this.proyectosFiltrados = proyectos;
      },
      error: (err: any) => {
        console.error('Error al cargar proyectos:', err);
      }
    });
  }

  private cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
      },
      error: (err: any) => {
        console.error('Error al cargar categorias:', err);
      }
    });
  }

  aplicarFiltros(filtros: any): void {
    this.proyectosFiltrados = this.proyectos.filter((p: Proyecto) => {
      const cumpleBusqueda = !filtros.busqueda ||
        filtros.busqueda === '' ||
        p.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const cumpleCategoria = !filtros.categoria ||
        filtros.categoria === '' ||
        p.categoriaId === Number(filtros.categoria);

      let cumplePresupuesto = true;
      if (filtros.presupuesto && filtros.presupuesto !== '') {
        const presupuestoPromedio = (p.presupuestoMin + p.presupuestoMax) / 2;

        switch (filtros.presupuesto) {
          case '0-1000':
            cumplePresupuesto = presupuestoPromedio <= 1000;
            break;
          case '1000-5000':
            cumplePresupuesto = presupuestoPromedio >= 1000 && presupuestoPromedio <= 5000;
            break;
          case '5000-10000':
            cumplePresupuesto = presupuestoPromedio >= 5000 && presupuestoPromedio <= 10000;
            break;
          case '10000+':
            cumplePresupuesto = presupuestoPromedio > 10000;
            break;
          default:
            cumplePresupuesto = true;
        }
      }

      return cumpleBusqueda && cumpleCategoria && cumplePresupuesto;
    });
  }

  getPresupuestoTexto(proyecto: Proyecto): string {
    try {
      if (!proyecto || !proyecto.presupuestoMin || !proyecto.presupuestoMax) {
        return 'Q0.00 - Q0.00';
      }

      const min = proyecto.presupuestoMin || 0;
      const max = proyecto.presupuestoMax || 0;

      const minFormato = min.toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      const maxFormato = max.toLocaleString('es-GT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      return `Q${minFormato} - Q${maxFormato}`;
    } catch (error) {
      return 'Q0.00 - Q0.00';
    }
  }

  getCategoriaNombre(proyecto: Proyecto): string {
    try {
      if (!proyecto) {
        return 'Sin categoria';
      }

      if (proyecto.categoria && typeof proyecto.categoria === 'object') {
        if ('nombre' in proyecto.categoria && proyecto.categoria.nombre) {
          return proyecto.categoria.nombre;
        }
      }

      if (typeof proyecto.categoria === 'string') {
        return proyecto.categoria;
      }

      if (proyecto.categoriaId && this.categorias && this.categorias.length > 0) {
        const categoria = this.categorias.find(c => c.id === proyecto.categoriaId);
        if (categoria) {
          return categoria.nombre;
        }
      }

      return 'Sin categoria';
    } catch (error) {
      return 'Sin categoria';
    }
  }

  getPropuestasCount(proyecto: Proyecto): number {
    try {
      if (!proyecto) {
        return 0;
      }

      if (typeof proyecto.propuestasCount === 'number') {
        return proyecto.propuestasCount;
      }

      if (typeof proyecto.propuestasCount === 'string') {
        const parsed = parseInt(proyecto.propuestasCount, 10);
        return isNaN(parsed) ? 0 : parsed;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  getPlazo(proyecto: Proyecto): number {
    try {
      if (!proyecto) {
        return 0;
      }

      if (typeof proyecto.plazo === 'number' && proyecto.plazo > 0) {
        return proyecto.plazo;
      }

      if (typeof proyecto.plazo === 'string') {
        const parsed = parseInt(proyecto.plazo, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }

      if (proyecto.fechaLimite) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fecha = new Date(proyecto.fechaLimite);
        fecha.setHours(0, 0, 0, 0);

        const diferencia = fecha.getTime() - hoy.getTime();
        const dias = Math.ceil(diferencia / (1000 * 3600 * 24));

        return dias > 0 ? dias : 0;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  getClienteNombre(proyecto: Proyecto): string {
    try {
      if (!proyecto) {
        return 'Cliente desconocido';
      }

      if (!proyecto.cliente) {
        return 'Cliente desconocido';
      }

      if (typeof proyecto.cliente === 'object' && proyecto.cliente !== null) {
        if ('nombreCompleto' in proyecto.cliente && typeof proyecto.cliente.nombreCompleto === 'string') {
          return proyecto.cliente.nombreCompleto;
        }
        if ('nombre' in proyecto.cliente && typeof proyecto.cliente.nombre === 'string') {
          return proyecto.cliente.nombre;
        }
      }

      if (typeof proyecto.cliente === 'string') {
        return proyecto.cliente;
      }

      if (typeof proyecto.cliente === 'number') {
        return `Usuario #${proyecto.cliente}`;
      }

      return 'Cliente desconocido';
    } catch (error) {
      return 'Cliente desconocido';
    }
  }

  getClienteCalificacion(proyecto: Proyecto): number {
    try {
      if (!proyecto) {
        return 0;
      }

      if (!proyecto.cliente) {
        return 0;
      }

      if (typeof proyecto.cliente === 'object' && proyecto.cliente !== null) {
        if ('calificacion' in proyecto.cliente) {
          const cal = proyecto.cliente.calificacion;
          if (typeof cal === 'number') {
            return Math.min(Math.max(cal, 0), 5);
          }
        }
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }
}
