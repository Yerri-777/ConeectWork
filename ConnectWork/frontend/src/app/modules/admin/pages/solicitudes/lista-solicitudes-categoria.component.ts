import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SolicitudHabilidad } from '../../../../core/models/solicitud.model';

@Component({
  selector: 'app-lista-solicitudes-habilidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-solicitudes-habilidad.component.html',
  styleUrls: ['./lista-solicitudes.component.css']
})
export class ListaSolicitudesHabilidadComponent implements OnInit {
  solicitudes: SolicitudHabilidad[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  private cargarSolicitudes(): void {
    this.solicitudService.listarSolicitudesHabilidad().subscribe({
      next: (data) => this.solicitudes = data,
      error: (err) => console.error('Error:', err)
    });
  }

  aceptarSolicitud(solicitud: SolicitudHabilidad): void {
    this.solicitudService.aceptarSolicitudHabilidad(solicitud.id!).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Solicitud aceptada');
        this.cargarSolicitudes();
      },
      error: () => this.notificationService.mostrarError('Error al aceptar solicitud')
    });
  }

  rechazarSolicitud(solicitud: SolicitudHabilidad): void {
    if (confirm('¿Rechazar esta solicitud de habilidad?')) {
      this.solicitudService.rechazarSolicitudHabilidad(solicitud.id!).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Solicitud rechazada');
          this.cargarSolicitudes();
        },
        error: () => this.notificationService.mostrarError('Error al rechazar solicitud')
      });
    }
  }
}
