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
  // Inicialización explícita para evitar errores de "index signature"
  solicitudes: SolicitudHabilidad[] = [];
  cargando: boolean = false;

  constructor(
    private solicitudService: SolicitudService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando = true;
    this.solicitudService.listarSolicitudesHabilidad().subscribe({
      next: (data) => {
        this.solicitudes = data || [];
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error:', err);
        this.notificationService.mostrarError('Error al cargar las solicitudes de habilidades');
        this.solicitudes = [];
      }
    });
  }

  aceptarSolicitud(solicitud: SolicitudHabilidad): void {
    if (!solicitud.id) return;

    this.solicitudService.aceptarSolicitudHabilidad(solicitud.id).subscribe({
      next: () => {
        this.notificationService.mostrarExito(`Habilidad "${solicitud.nombre}" aprobada correctamente`);
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error('Error:', error);
        this.notificationService.mostrarError('No se pudo procesar la aceptación');
      }
    });
  }

  rechazarSolicitud(solicitud: SolicitudHabilidad): void {
    if (!solicitud.id) return;

    if (confirm(`¿Estás seguro de rechazar la habilidad: ${solicitud.nombre}?`)) {
      this.solicitudService.rechazarSolicitudHabilidad(solicitud.id).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Solicitud rechazada');
          this.cargarSolicitudes();
        },
        error: (error) => {
          console.error('Error:', error);
          this.notificationService.mostrarError('Error al rechazar la solicitud');
        }
      });
    }
  }
}
