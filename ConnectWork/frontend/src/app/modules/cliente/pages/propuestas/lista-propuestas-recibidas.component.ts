import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-lista-propuestas-recibidas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-propuestas-recibidas.component.html',
  styleUrls: ['./propuestas.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListaPropuestasRecibidasComponent implements OnInit {
  propuestas: any[] = [];
  cargando = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPropuestas();
  }

  cargarPropuestas(): void {
    this.cargando = true;
    try {

      const proyectosRaw = localStorage.getItem('connectwork_proyectos');
      const proyectos = proyectosRaw ? JSON.parse(proyectosRaw) : [];


      this.propuestas = proyectos.flatMap((p: any) =>
        (p.propuestas || []).map((prop: any) => ({
          ...prop,
          proyectoId: p.id,
          proyectoTitulo: p.titulo,

          montoOferta: prop.monto,
          tiempoEstimado: prop.plazo,
          descripcion: prop.contenido,
          freelancerNombre: prop.freelancer?.nombre || 'Freelancer Demo',
          freelancerRating: 5.0
        }))
      );

      console.log('Propuestas encontradas para el cliente:', this.propuestas);

    } catch (error) {
      console.error('[ListaPropuestas] Error:', error);
      this.notificationService.mostrarError('Error al sincronizar propuestas');
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  verDetalle(id: number): void {
    this.router.navigate(['/cliente/propuestas/detalle', id]);
  }

  rechazar(id: number): void {
    if (!confirm('¿Deseas rechazar esta propuesta?')) return;

    try {
      const proyectosRaw = localStorage.getItem('connectwork_proyectos');
      let proyectos = proyectosRaw ? JSON.parse(proyectosRaw) : [];

      proyectos = proyectos.map((proj: any) => {
        if (proj.propuestas) {
          proj.propuestas = proj.propuestas.map((p: any) =>
            p.id === id ? { ...p, estado: 'RECHAZADA' } : p
          );
        }
        return proj;
      });

      localStorage.setItem('connectwork_proyectos', JSON.stringify(proyectos));
      this.notificationService.mostrarExito('Propuesta rechazada');
      this.cargarPropuestas();
    } catch (e) {
      this.notificationService.mostrarError('No se pudo procesar el rechazo');
    }
  }

  trackByPropuesta(index: number, propuesta: any): number {
    return propuesta.id || index;
  }
}
