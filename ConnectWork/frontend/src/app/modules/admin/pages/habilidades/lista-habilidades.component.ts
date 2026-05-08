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

  constructor(
    private habilidadService: HabilidadService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarHabilidades();
  }

  private cargarHabilidades(): void {
    this.habilidadService.listar().subscribe({
      next: (data) => this.habilidades = data,
      error: () => this.notificationService.mostrarError('Error al cargar habilidades')
    });
  }

  abrirFormulario(): void {
    this.habilidadEditando = null;
    this.mostrarFormulario = true;
  }

  editarHabilidad(habilidad: Habilidad): void {
    this.habilidadEditando = habilidad;
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
  }

  confirmarAccion(): void {
    if (!this.habilidadSeleccionada) return;
    const accion = this.habilidadSeleccionada.activo
      ? this.habilidadService.desactivar(this.habilidadSeleccionada.id!)
      : this.habilidadService.activar(this.habilidadSeleccionada.id!);

    accion.subscribe({
      next: () => {
        this.notificationService.mostrarExito('Habilidad actualizada');
        this.cerrarModalEliminar();
        this.cargarHabilidades();
      }
    });
  }
}
