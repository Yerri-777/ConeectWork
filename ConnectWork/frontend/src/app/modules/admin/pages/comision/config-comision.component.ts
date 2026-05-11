import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SaldoService } from '../../../../core/services/saldo.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-config-comision',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-comision.component.html',
  styleUrls: ['./config-comision.component.css']
})
export class ConfigComisionComponent implements OnInit {
  // Variables conectadas al HTML vía Interpolación y ngModel
  comisionActual = 0;
  nuevosPorcentaje: number | null = null;
  ultimaActualizacion: Date = new Date();
  historial: any[] = [];

  // Estados de UI
  cargando = false;
  guardando = false;

  constructor(
    private saldoService: SaldoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  /**
   * Orquesta la carga de datos para asegurar sincronía
   */
  private cargarDatosIniciales(): void {
    this.cargarComision();
    this.cargarHistorial();
  }

  /**
   * Obtiene la comisión vigente y sincroniza el input del formulario
   */
  cargarComision(): void {
    this.cargando = true;
    this.saldoService.obtenerComisionActual().subscribe({
      next: (data) => {
        this.comisionActual = data.porcentaje || 0;
        // Inicializamos el input con el valor actual para la lógica de validación del botón
        this.nuevosPorcentaje = data.porcentaje || 0;
        this.ultimaActualizacion = new Date(data.fechaInicio || new Date());
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al cargar comisión:', error);
        this.notificationService.mostrarError('No se pudo obtener la comisión actual');
      }
    });
  }

  /**
   * Obtiene la lista de cambios históricos para la tabla
   */
  cargarHistorial(): void {
    this.saldoService.obtenerHistorialComisiones().subscribe({
      next: (data) => {
        this.historial = data || [];
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.historial = [];
      }
    });
  }

  /**
   * Ejecuta el cambio de comisión tras validaciones
   * Vinculado al (click) del botón en el HTML
   */
  cambiarComision(): void {
    // Validamos que el valor no sea nulo y esté en el rango permitido (0-50 según tu HTML)
    if (this.nuevosPorcentaje === null || this.nuevosPorcentaje < 0 || this.nuevosPorcentaje > 50) {
      this.notificationService.mostrarAdvertencia('El porcentaje debe estar entre 0% y 50%');
      return;
    }

    // Evitamos enviar si no hubo cambios reales
    if (this.nuevosPorcentaje === this.comisionActual) {
      this.notificationService.mostrarAdvertencia('El porcentaje es igual al actual');
      return;
    }

    this.guardando = true;
    this.saldoService.cambiarComision(this.nuevosPorcentaje).subscribe({
      next: () => {
        this.guardando = false;
        this.notificationService.mostrarExito('Comisión actualizada correctamente');

        // Refrescamos los datos para actualizar la UI y el historial
        this.cargarComision();
        this.cargarHistorial();
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al cambiar comisión:', error);
        this.notificationService.mostrarError('Error al actualizar la comisión');
      }
    });
  }
}
