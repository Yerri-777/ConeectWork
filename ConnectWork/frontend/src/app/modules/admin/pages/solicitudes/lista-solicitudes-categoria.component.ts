import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../../core/services/solicitud.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Solicitud {
  id: number;
  nombreCliente?: string;
  nombre: string;
  descripcion?: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'ACEPTADA' | 'RECHAZADA';
}

@Component({
  selector: 'app-lista-solicitudes-categoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-solicitudes-categoria.component.html',
  styleUrls: ['./lista-solicitudes.component.css']
})
export class ListaSolicitudesCategoriaComponent implements OnInit, OnDestroy {

  // ─── PROPIEDADES ───────────────────────────────────────────────────────
  solicitudes: Solicitud[] = [];
  cargando: boolean = false;

  private destroy$ = new Subject<void>();

  // ─── CONSTRUCTOR ───────────────────────────────────────────────────────
  constructor(
    private solicitudService: SolicitudService,
    private notificationService: NotificationService
  ) {}

  // ─── CICLO DE VIDA ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── MÉTODOS PÚBLICOS ──────────────────────────────────────────────────

  /**
   * Carga todas las solicitudes de habilidad/categoría pendientes
   */
  cargarSolicitudes(): void {
    this.cargando = true;

    this.solicitudService.listarSolicitudesHabilidad()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const raw = Array.isArray(data) ? (data as any[]) : [];
          this.solicitudes = raw
            .map(item => ({
              id: typeof item.id === 'number' ? item.id : Number(item.id),
              nombreCliente: item.nombreCliente ?? item.nombre_cliente ?? '',
              nombre: item.nombre ?? item.nombreCategoria ?? '',
              descripcion: item.descripcion ?? '',
              estado: (item.estado ?? 'PENDIENTE') as Solicitud['estado']
            }))
            .filter(s => typeof s.id === 'number' && !isNaN(s.id));
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar solicitudes:', err);
          this.notificationService.mostrarError('Error al cargar solicitudes');
          this.solicitudes = [];
          this.cargando = false;
        }
      });
  }

  /**
   * Acepta una solicitud de habilidad/categoría
   * @param sol Solicitud a aceptar
   */
  aceptarSolicitud(sol: Solicitud): void {
    if (!sol || !sol.id) {
      this.notificationService.mostrarAdvertencia('Solicitud no válida');
      return;
    }

    const confirmacion = confirm(
      `¿Desea aceptar la sugerencia de categoría "${sol.nombre}" de ${sol.nombreCliente}?`
    );

    if (!confirmacion) return;

    this.solicitudService.aceptarSolicitudHabilidad(sol.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Solicitud aceptada correctamente');
          this.cargarSolicitudes();
        },
        error: (error) => {
          console.error('Error al aceptar solicitud:', error);
          this.notificationService.mostrarError('No se pudo aceptar la solicitud');
        }
      });
  }

  /**
   * Rechaza una solicitud de habilidad/categoría
   * @param sol Solicitud a rechazar
   */
  rechazarSolicitud(sol: Solicitud): void {
    if (!sol || !sol.id) {
      this.notificationService.mostrarAdvertencia('Solicitud no válida');
      return;
    }

    const confirmacion = confirm(
      `¿Desea rechazar la sugerencia de categoría "${sol.nombre}" de ${sol.nombreCliente}?`
    );

    if (!confirmacion) return;

    this.solicitudService.rechazarSolicitudHabilidad(sol.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.mostrarExito('Solicitud rechazada correctamente');
          this.cargarSolicitudes();
        },
        error: (error) => {
          console.error('Error al rechazar solicitud:', error);
          this.notificationService.mostrarError('Error al rechazar la solicitud');
        }
      });
  }

  // ─── MÉTODOS DE OPTIMIZACIÓN ───────────────────────────────────────────

  /**
   * TrackBy para optimizar *ngFor
   * Evita que Angular recree elementos innecesariamente
   * @param index Índice del item
   * @param item Solicitud
   * @returns ID de la solicitud para tracking
   */
  trackBySolicitud(index: number, item: Solicitud): number {
    return item.id;
  }
}