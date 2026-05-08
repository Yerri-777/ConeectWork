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
  comisionActual = 0;
  nuevosPorcentaje = 0;
  ultimaActualizacion: Date = new Date();
  historial: any[] = [];

  constructor(
    private saldoService: SaldoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarComision();
    this.cargarHistorial();
  }

  private cargarComision(): void {
    this.saldoService.obtenerComisionActual().subscribe({
      next: (data) => {
        this.comisionActual = data.porcentaje;
        this.nuevosPorcentaje = data.porcentaje;
        this.ultimaActualizacion = new Date(data.fechaInicio);
      },
      error: (error) => {
        console.error('Error al cargar comisión:', error);
        this.notificationService.mostrarError('No se pudo obtener la comisión actual');
      }
    });
  }

  private cargarHistorial(): void {
    this.saldoService.obtenerHistorialComisiones().subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (error) => console.error('Error al cargar historial:', error)
    });
  }

  cambiarComision(): void {
    if (this.nuevosPorcentaje < 0 || this.nuevosPorcentaje > 50) {
      this.notificationService.mostrarAdvertencia('El porcentaje debe estar entre 0% y 50%');
      return;
    }

    if (confirm(`¿Estás seguro de cambiar la comisión de la plataforma a ${this.nuevosPorcentaje}%?`)) {
      this.saldoService.cambiarComision(this.nuevosPorcentaje).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Comisión actualizada correctamente');
          this.cargarComision();
          this.cargarHistorial();
        },
        error: (error) => {
          console.error('Error al cambiar comisión:', error);
          this.notificationService.mostrarError('Hubo un error al intentar actualizar la comisión');
        }
      });
    }
  }
}
