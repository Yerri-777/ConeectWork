import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SolicitudCategoria } from '../../../../core/models/solicitud.model';

@Component({
  selector: 'app-lista-solicitudes-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-solicitudes-categoria.component.html',
  styleUrls: ['./lista-solicitudes.component.css']
})
export class ListaSolicitudesCategoriaComponent implements OnInit {
[x: string]: any;
  solicitudes: SolicitudCategoria[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  private cargarSolicitudes(): void {
    this.solicitudService.listarSolicitudesCategoria().subscribe({
      next: (data) => this.solicitudes = data,
      error: (err) => console.error('Error:', err)
    });
  }

  aceptarSolicitud(solicitud: SolicitudCategoria): void {
    this.solicitudService.aceptarSolicitudCategoria(solicitud.id!).subscribe({
      next: () => {
        this.notificationService.mostrarExito('Categoría aceptada y creada');
        this.cargarSolicitudes();
      },
      error: () => this.notificationService.mostrarError('Error al aceptar categoría')
    });
  }

  rechazarSolicitud(solicitud: SolicitudCategoria): void {
    if (confirm('¿Rechazar esta propuesta de categoría?')) {
      this.solicitudService.rechazarSolicitudCategoria(solicitud.id!).subscribe({
        next: () => {
          this.notificationService.mostrarExito('Solicitud rechazada');
          this.cargarSolicitudes();
        },
        error: () => this.notificationService.mostrarError('Error al rechazar solicitud')
      });
    }
  }
}
