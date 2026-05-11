import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabilidadService } from '../../../../core/services/habilidad.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModalConfirmarComponent } from '../../../../shared/componentes/modal-confirmar/modal-confirmar.component';
import { FormularioHabilidadComponent } from './formulario-habilidad.component';
import { Habilidad } from '../../../../core/models/habilidad.model';

@Component({
  selector: 'app-lista-habilidades',
  standalone: true,
  imports: [CommonModule, ModalConfirmarComponent, FormularioHabilidadComponent],
  templateUrl: './lista-habilidades.component.html',
  styleUrls: ['./lista-habilidades.component.css']
})
export class ListaHabilidadesComponent implements OnInit {
  habilidades: Habilidad[] = [];
  mostrarFormulario = false;
  habilidadEditando: Habilidad | null = null;
  habilidadSeleccionada: Habilidad | null = null;
  modalEliminarAbierto = false;
  cargando = false;

  constructor(
    private habilidadService: HabilidadService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarHabilidades();
  }

  cargarHabilidades(): void {
    this.cargando = true;
    this.habilidadService.listar().subscribe({
      next: (data) => {
        this.habilidades = data || [];
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar habilidades:', error);
        this.notificationService.mostrarError('Error al cargar el listado de habilidades');
        this.habilidades = [];
      }
    });
  }

  abrirFormulario(): void {
    this.habilidadEditando = null;
    this.mostrarFormulario = true;
  }

  editarHabilidad(habilidad: Habilidad): void {
    // Clonamos para evitar que cambios en el formulario se vean en la tabla antes de guardar
    this.habilidadEditando = { ...habilidad };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.habilidadEditando = null;
  }

  onHabilidadGuardada(): void {
    this.cerrarFormulario();
    this.cargarHabilidades();
  }

  abrirModalEliminar(habilidad: Habilidad): void {
    this.habilidadSeleccionada = habilidad;
    this.modalEliminarAbierto = true;
  }

  cerrarModalEliminar(): void {
    this.modalEliminarAbierto = false;
    this.habilidadSeleccionada = null;
  }

  confirmarAccion(): void {
    if (!this.habilidadSeleccionada || !this.habilidadSeleccionada.id) return;

    this.cargando = true;
    const esDesactivar = this.habilidadSeleccionada.activo;
    const accion$ = esDesactivar
      ? this.habilidadService.desactivar(this.habilidadSeleccionada.id)
      : this.habilidadService.activar(this.habilidadSeleccionada.id);

    accion$.subscribe({
      next: () => {
        this.notificationService.mostrarExito(
          esDesactivar ? 'Habilidad desactivada correctamente' : 'Habilidad activada correctamente'
        );
        this.cerrarModalEliminar();
        this.cargarHabilidades();
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error en la operación:', error);
        this.notificationService.mostrarError('No se pudo cambiar el estado de la habilidad');
      }
    });
  }
}
