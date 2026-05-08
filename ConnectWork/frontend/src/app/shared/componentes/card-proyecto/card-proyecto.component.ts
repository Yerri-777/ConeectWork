import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Proyecto } from '../../../core/models/proyecto.model';

@Component({
  selector: 'app-card-proyecto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card-proyecto.component.html',
  styleUrls: ['./card-proyecto.component.css']
})
export class CardProyectoComponent {

  @Input() proyecto!: Proyecto;
  @Input() mostrarAcciones = true;
  @Input() puedeEditar = false;
  @Input() puedeEliminar = false;
  @Input() puedeEnviarPropuesta = false;

  @Output() verDetalles = new EventEmitter<Proyecto>();
  @Output() editar = new EventEmitter<Proyecto>();
  @Output() eliminar = new EventEmitter<Proyecto>();
  @Output() enviarPropuesta = new EventEmitter<Proyecto>();

  onVerDetalles(): void {
    if (this.proyecto) {
      this.verDetalles.emit(this.proyecto);
    }
  }

  onEditar(): void {
    if (this.proyecto && this.puedeEditar) {
      this.editar.emit(this.proyecto);
    }
  }

  onEliminar(): void {
    if (this.proyecto && this.puedeEliminar) {
      this.eliminar.emit(this.proyecto);
    }
  }

  onEnviarPropuesta(): void {
    if (this.proyecto && this.puedeEnviarPropuesta) {
      this.enviarPropuesta.emit(this.proyecto);
    }
  }

  getPresupuestoTexto(): string {
    if (!this.proyecto) {
      return 'Q0.00 - Q0.00';
    }

    try {
      const min = this.proyecto.presupuestoMin || 0;
      const max = this.proyecto.presupuestoMax || 0;

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

  getCategoriaNombre(): string {
    if (!this.proyecto) {
      return 'Sin categoria';
    }

    if (this.proyecto.categoria && typeof this.proyecto.categoria === 'object') {
      if ('nombre' in this.proyecto.categoria && this.proyecto.categoria.nombre) {
        return this.proyecto.categoria.nombre;
      }
    }

    if (typeof this.proyecto.categoria === 'string') {
      return this.proyecto.categoria;
    }

    if (this.proyecto.nombreCategoria) {
      return this.proyecto.nombreCategoria;
    }

    return 'Sin categoria';
  }

  getClienteNombre(): string {
    if (!this.proyecto) {
      return 'Cliente desconocido';
    }

    if (!this.proyecto.cliente) {
      return 'Cliente desconocido';
    }

    if (typeof this.proyecto.cliente === 'object' && this.proyecto.cliente !== null) {
      if ('nombreCompleto' in this.proyecto.cliente && typeof this.proyecto.cliente.nombreCompleto === 'string') {
        return this.proyecto.cliente.nombreCompleto;
      }
      if ('nombre' in this.proyecto.cliente && typeof this.proyecto.cliente.nombre === 'string') {
        return this.proyecto.cliente.nombre;
      }
    }

    if (typeof this.proyecto.cliente === 'string') {
      return this.proyecto.cliente;
    }

    if (this.proyecto.nombreCliente) {
      return this.proyecto.nombreCliente;
    }

    return 'Cliente desconocido';
  }

  getClienteCalificacion(): number {
    if (!this.proyecto) {
      return 0;
    }

    if (!this.proyecto.cliente) {
      return 0;
    }

    if (typeof this.proyecto.cliente === 'object' && this.proyecto.cliente !== null) {
      if ('calificacion' in this.proyecto.cliente) {
        const cal = this.proyecto.cliente.calificacion;
        if (typeof cal === 'number') {
          return Math.min(Math.max(cal, 0), 5);
        }
      }
    }

    return 0;
  }

  getPropuestasCount(): number {
    if (!this.proyecto) {
      return 0;
    }

    if (typeof this.proyecto.propuestasCount === 'number') {
      return this.proyecto.propuestasCount;
    }

    if (typeof this.proyecto.propuestasCount === 'string') {
      const parsed = parseInt(this.proyecto.propuestasCount, 10);
      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  getPlazo(): number {
    if (!this.proyecto) {
      return 0;
    }

    if (typeof this.proyecto.plazo === 'number' && this.proyecto.plazo > 0) {
      return this.proyecto.plazo;
    }

    if (typeof this.proyecto.plazo === 'string') {
      const parsed = parseInt(this.proyecto.plazo, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return 0;
  }

  getEstadoBadgeClass(): string {
    if (!this.proyecto) {
      return 'badge-default';
    }

    switch (this.proyecto.estado) {
      case 'ABIERTO':
        return 'badge-success';
      case 'EN_PROGRESO':
        return 'badge-info';
      case 'ENTREGA_PENDIENTE':
        return 'badge-warning';
      case 'COMPLETADO':
        return 'badge-secondary';
      case 'CANCELADO':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  }

  getEstadoTexto(): string {
    if (!this.proyecto) {
      return 'Desconocido';
    }

    switch (this.proyecto.estado) {
      case 'ABIERTO':
        return 'Abierto';
      case 'EN_REVISION':
        return 'En revision';
      case 'EN_PROGRESO':
        return 'En progreso';
      case 'ENTREGA_PENDIENTE':
        return 'Entrega pendiente';
      case 'COMPLETADO':
        return 'Completado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }
}
